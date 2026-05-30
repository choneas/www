import type { Metadata } from 'next'
import { getTranslations, getLocale } from "next-intl/server"
import { getAllPosts } from "@/lib/content"
import { ArticleList } from '@/components/article-list'

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('Article')
    return {
        title: t('title'),
        description: t('description'),
        openGraph: {
            title: t('title'),
            description: t('description'),
            type: 'website',
            url: '/article',
        },
        twitter: {
            card: 'summary_large_image',
            title: t('title'),
            description: t('description'),
        },
    }
}

export default async function Contents() {
    const t = await getTranslations("Article")
    const tt = await getTranslations("Tag")
    const locale = await getLocale()

    const { articles } = await getAllPosts(
        (key: string) => tt(key),
        locale,
        false
    )

    return (
        <main id="main-content" className="main-content container mx-auto px-8 sm:mt-20 sm:px-24 pt-8">
            <h1>{t('title')}</h1>
            <p>{t('description')}</p>

            <div className='mt-8'>
                <ArticleList articles={articles} />
            </div>
        </main>
    )
}
