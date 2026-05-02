import { create } from 'zustand';
import type { PostMetadata } from '@/lib/content';

interface PostMetadataStore {
    postMetadata?: PostMetadata
    setPostMetadata?: (article: PostMetadata) => void
}

export const usePostMetadata = create<PostMetadataStore>((set) => ({
    postMetadata: {
        title: '',
        created_time: new Date,
        last_edited_time: new Date
    },
    setPostMetadata: (article: PostMetadata) => set({ postMetadata: article })
}));