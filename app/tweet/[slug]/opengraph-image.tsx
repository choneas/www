import { OG_SIZE, OG_CONTENT_TYPE, generateArticleOgImage } from '@/lib/og-image'

export const alt = 'Tweet OpenGraph Image'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return generateArticleOgImage(slug, true)
}
