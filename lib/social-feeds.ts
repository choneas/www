"use server"

import { cache } from 'react';
import type { ReactNode } from "react";
import type { PostMetadata } from "./content";

// ============================================================================
// Types (consolidated from @constants/types.ts)
// ============================================================================

export interface SocialLink {
    platform: string
    name?: string
    href?: string
    color?: string
    icon?: ReactNode
}

export interface TechStack {
    name: string
    icon: ReactNode
    href?: string
}

export interface Project {
    isGithubRepo?: boolean
    repo?: string
    name?: string
    link?: string
    description?: string
    cover?: string
}

export interface GithubRepoInfo {
    description: string
    stargazers_count: number
    updated: string
}

// Bluesky API base URL
const BLUESKY_API_BASE = 'https://public.api.bsky.app/xrpc';

// X/Nitter instances for RSS fallback (updated list of working instances)
const NITTER_INSTANCES = [
    'nitter.privacydev.net',
    'nitter.poast.org',
    'nitter.woodland.cafe',
    'nitter.esmailelbob.xyz',
];
const RSS_TO_JSON_API = 'https://api.rss2json.com/v1/api.json';

// Timeout for fetch requests (5 seconds)
const FETCH_TIMEOUT = 5000;

/**
 * Fetch with timeout support
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = FETCH_TIMEOUT): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        return response;
    } finally {
        clearTimeout(timeoutId);
    }
}

interface BlueskyPost {
    uri: string;
    cid: string;
    author: {
        did: string;
        handle: string;
        displayName: string;
        avatar: string;
    };
    record: {
        text: string;
        createdAt: string;
    };
    embed?: {
        images?: Array<{
            fullsize: string;
            thumb: string;
            alt: string;
        }>;
    };
    likeCount?: number;
    repostCount?: number;
    replyCount?: number;
    quoteCount?: number;
}

interface BlueskyFeedResponse {
    feed: Array<{
        post: BlueskyPost;
        reason?: unknown;
    }>;
}

interface BlueskyProfile {
    did: string;
    handle: string;
    displayName: string;
    avatar: string;
}

/**
 * Fetch Bluesky posts with engagement stats
 */
export const getBlueskyPosts = cache(async (handle: string, limit: number = 10): Promise<PostMetadata[]> => {
    try {
        const url = `${BLUESKY_API_BASE}/app.bsky.feed.getAuthorFeed?actor=${handle}&limit=${limit}`;
        const res = await fetch(url, { next: { revalidate: 300 } });

        if (!res.ok) return [];

        const data: BlueskyFeedResponse = await res.json();

        return data.feed
            .filter((item) => item.post.record && !item.reason)
            .map((item): PostMetadata => {
                const post = item.post;
                const images = post.embed?.images?.map((img) => img.fullsize) || [];
                const postId = post.uri.split('/').pop() || post.cid;

                return {
                    id: `bsky-${postId}`,
                    title: '',
                    description: post.record.text,
                    type: 'Tweet',
                    platform: 'bluesky',
                    social: {
                        postId,
                        username: handle,
                        stats: {
                            likeCount: post.likeCount || 0,
                            repostCount: post.repostCount || 0,
                            replyCount: post.replyCount || 0,
                            quoteCount: post.quoteCount || 0,
                        },
                    },
                    created_time: new Date(post.record.createdAt),
                    last_edited_time: new Date(post.record.createdAt),
                    photos: images,
                };
            });
    } catch {
        // Silently fail for better UX
        return [];
    }
});

/**
 * Fetch Bluesky user avatar
 */
export const getBlueskyAvatar = cache(async (handle: string): Promise<string | null> => {
    try {
        const res = await fetch(
            `${BLUESKY_API_BASE}/app.bsky.actor.getProfile?actor=${handle}`,
            { next: { revalidate: 3600 } }
        );

        if (!res.ok) return null;

        const data: BlueskyProfile = await res.json();
        return data.avatar || null;
    } catch {
        // Silently fail for better UX
        return null;
    }
});


interface RssItem {
    guid: string;
    title: string;
    description: string;
    pubDate: string;
    enclosure?: {
        link: string;
    };
}

interface RssResponse {
    status: string;
    items: RssItem[];
}

/**
 * Fetch X/Twitter posts via Nitter RSS
 */
export const getXPosts = cache(async (username: string, limit: number = 10): Promise<PostMetadata[]> => {
    for (const instance of NITTER_INSTANCES) {
        try {
            const rssUrl = `https://${instance}/${username}/rss`;
            const res = await fetchWithTimeout(
                `${RSS_TO_JSON_API}?rss_url=${encodeURIComponent(rssUrl)}`,
                { next: { revalidate: 300 } } as RequestInit
            );

            if (!res.ok) continue;

            const data: RssResponse = await res.json();
            if (data.status !== 'ok') continue;

            return data.items.slice(0, limit).map((item): PostMetadata => {
                const postId = item.guid.split('/').pop() || item.guid;
                const text = item.description.replace(/<[^>]*>/g, '').trim();

                return {
                    id: `x-${postId}`,
                    title: '',
                    description: text,
                    type: 'Tweet',
                    platform: 'x',
                    social: {
                        postId,
                        username,
                    },
                    created_time: new Date(item.pubDate),
                    last_edited_time: new Date(item.pubDate),
                    photos: item.enclosure?.link ? [item.enclosure.link] : [],
                };
            });
        } catch {
            continue;
        }
    }
    return [];
});

/**
 * Fetch X/Twitter user avatar via Nitter
 */
export const getXAvatar = cache(async (username: string): Promise<string | null> => {
    for (const instance of NITTER_INSTANCES) {
        try {
            const res = await fetchWithTimeout(
                `https://${instance}/${username}`,
                { next: { revalidate: 3600 } } as RequestInit
            );

            if (!res.ok) continue;

            const html = await res.text();
            const match = html.match(/<img[^>]*class="profile-avatar"[^>]*src="([^"]*)"/);
            if (match) {
                return match[1].replace(/^\/pic/, 'https://pbs.twimg.com');
            }
        } catch {
            continue;
        }
    }
    return null;
});

/**
 * Get social media avatars for configured accounts
 */
export const getSocialAvatars = cache(async () => {
    const xUsername = process.env.X_USERNAME;
    const blueskyHandle = process.env.BLUESKY_HANDLE;

    const [xAvatar, blueskyAvatar] = await Promise.all([
        xUsername ? getXAvatar(xUsername) : Promise.resolve(null),
        blueskyHandle ? getBlueskyAvatar(blueskyHandle) : Promise.resolve(null),
    ]);

    return { xAvatar, blueskyAvatar };
});

/**
 * Get all social media posts
 */
export const getAllSocialPosts = cache(async (): Promise<PostMetadata[]> => {
    const xUsername = process.env.X_USERNAME;
    const blueskyHandle = process.env.BLUESKY_HANDLE;

    const [xPosts, blueskyPosts] = await Promise.all([
        xUsername ? getXPosts(xUsername, 10) : Promise.resolve([]),
        blueskyHandle ? getBlueskyPosts(blueskyHandle, 10) : Promise.resolve([]),
    ]);

    return [...xPosts, ...blueskyPosts];
});
