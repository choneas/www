import type { PostMetadata } from "@/lib/content";

export function getExternalUrl(moment: PostMetadata): string | null {
  if (moment.platform === 'x' && moment.social?.postId && moment.social?.username) {
    return `https://x.com/${moment.social.username}/status/${moment.social.postId}`;
  }
  if (moment.platform === 'bluesky' && moment.social?.postId && moment.social?.username) {
    return `https://bsky.app/profile/${moment.social.username}/post/${moment.social.postId}`;
  }
  return null;
}
