import type { TableOfContentsEntry } from 'notion-utils'

export type Platform = 'notion' | 'x' | 'bluesky';

export interface SocialStats {
    likeCount: number;
    repostCount: number;
    replyCount: number;
    quoteCount?: number;
}

export interface SocialPostInfo {
    postId: string;
    username: string;
    stats?: SocialStats;
}

export interface Author {
    uuid: string
    name: string
    avatar: string
}

export interface PostMetadata {
    id?: string
    notionid?: string
    title: string
    type?: "Article" | "Tweet"
    platform?: Platform
    social?: SocialPostInfo
    slug?: string
    language?: string
    author?: Author[]
    tags?: string[]
    description?: string
    toc?: TableOfContentsEntry[]
    icon?: string
    cover?: string
    cover_preview?: string
    cover_position?: number
    photos?: string[]
    imagePreview?: boolean
    created_time: Date
    last_edited_time: Date
    readingTimeMinutes?: number
    readingTime?: string
}

export interface PropertySchema {
    prop: string
    name: string
    type: string
    options?: Array<{
        id: string
        color: string
        value: string
    }>
}
