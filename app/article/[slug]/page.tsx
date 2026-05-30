import type { Metadata } from 'next'
import { notFound } from 'next/navigation';
import { getTranslations, getLocale } from 'next-intl/server';
import NotionPage from "@/components/notion-page";
import { PostHeader } from "@/components/post-header";
import { Comment } from '@/components/comment';
import { TableOfContents } from '@/components/table-of-contents';
import { ViewTracker } from '@/components/view-tracker';
import ArticleNotFoundError, { getPost } from "@/lib/content";
import { getStats } from '@/utils/redis-interactions';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const slug = (await params).slug;
    const tagT = await getTranslations('Tag');
    const locale = await getLocale();

    const { metadata } = await getPost(
        slug,
        (key: string) => tagT(key),
        locale
    );

    return {
        title: metadata.title,
        description: metadata.description,
        keywords: metadata.tags,
        openGraph: {
            title: metadata.title,
            description: metadata.description,
            type: 'article',
            url: `/article/${slug}`,
            images: [{ url: `/article/${slug}/opengraph-image`, width: 1200, height: 630 }],
            publishedTime: metadata.created_time?.toISOString(),
            modifiedTime: metadata.last_edited_time?.toISOString(),
        },
        twitter: {
            card: 'summary_large_image',
            title: metadata.title,
            description: metadata.description,
        },
    };
}

export default async function Article({ params }: PageProps) {
    const slug = (await params).slug;
    const tagT = await getTranslations('Tag');
    const locale = await getLocale();

    try {
        const [{ metadata, recordMap }, stats] = await Promise.all([
            getPost(slug, (key: string) => tagT(key), locale),
            getStats(slug),
        ]);

        return (
            <main id="main-content">
                <ViewTracker slug={slug} />
                <PostHeader post={metadata} isTweet={false} views={stats.views} />

                <div className="max-w-6xl mx-auto px-8 sm:px-24 md:px-48">
                    <NotionPage recordMap={recordMap} />
                    <Comment type='article' metadata={metadata} className='mt-8' />
                </div>

                <TableOfContents toc={metadata.toc!} type="Article" />
            </main>
        );
    } catch (error) {
        if (error instanceof ArticleNotFoundError) {
            notFound();
        }
        throw error;
    }
}
