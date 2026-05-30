import type { Metadata } from 'next'
import { notFound } from 'next/navigation';
import { getTranslations, getLocale } from 'next-intl/server';
import NotionPage from "@/components/notion-page";
import { PostHeader } from "@/components/post-header";
import { Comment } from '@/components/comment';
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
    locale,
    true
  );

  return {
    title: (metadata.title || metadata.created_time.toLocaleDateString()),
    description: metadata.description,
    keywords: metadata.tags,
    openGraph: {
      title: metadata.title || metadata.created_time.toLocaleDateString(),
      description: metadata.description,
      type: 'article',
      url: `/tweet/${slug}`,
      images: metadata.cover ? [{ url: metadata.cover }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: metadata.title || metadata.created_time.toLocaleDateString(),
      description: metadata.description,
    },
  };
}

export default async function TweetPage({ params }: PageProps) {
  const slug = (await params).slug;
  const tagT = await getTranslations('Tag');
  const locale = await getLocale();

    try {
        const [{ metadata, recordMap }, stats] = await Promise.all([
            getPost(slug, (key: string) => tagT(key), locale, true),
            getStats(slug),
        ]);

        return (
            <main id="main-content">
                <ViewTracker slug={slug} />
                <PostHeader post={metadata} views={stats.views} />

        <div className='article-container pt-8'>
          <NotionPage recordMap={recordMap} type="tweet-details" />
          <Comment type='tweet' metadata={metadata} className='mt-8' />
        </div>
      </main>
    );
  } catch (error) {
    if (error instanceof ArticleNotFoundError) {
      notFound();
    }
    throw error;
  }
}
