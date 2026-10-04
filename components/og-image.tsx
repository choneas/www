import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { getTranslations, getLocale } from 'next-intl/server'
import { getPost } from '@/lib/content'

export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = 'image/png'

/** Load a local file as base64 data URL */
async function toDataUrl(filePath: string, mime: string): Promise<string> {
    const data = await readFile(filePath)
    return `data:${mime};base64,${data.toString('base64')}`
}

/** Fetch a remote image as base64 data URL, returns null on failure */
async function fetchRemoteAsDataUrl(url: string): Promise<string | null> {
    try {
        const res = await fetch(url)
        if (!res.ok) return null
        const buf = await res.arrayBuffer()
        const mime = res.headers.get('content-type') || 'image/jpeg'
        return `data:${mime};base64,${Buffer.from(buf).toString('base64')}`
    } catch {
        return null
    }
}

/**
 * Generate OG/Twitter image for an article slug.
 * Shared between opengraph-image.tsx and twitter-image.tsx.
 */
export async function generateArticleOgImage(slug: string, isTweet?: boolean): Promise<ImageResponse | Response> {
    const locale = await getLocale()
    const tagT = await getTranslations('Tag')
    const tm = await getTranslations('Metadata')

    let metadata
    try {
        const post = await getPost(slug, (key: string) => tagT(key), locale, isTweet)
        metadata = post.metadata
    } catch {
        return new Response('Not Found', { status: 404 })
    }

    // Load static fonts (Satori does not support variable fonts)
    const [notoSerifMedium, notoSerifBold, googleSansCodeData] = await Promise.all([
        readFile(join(process.cwd(), 'public/fonts/noto-serif-sc/NotoSerifSC-Medium.ttf')),
        readFile(join(process.cwd(), 'public/fonts/noto-serif-sc/NotoSerifSC-Bold.ttf')),
        readFile(join(process.cwd(), 'public/fonts/google-sans-code/GoogleSansCode-Bold.ttf')),
    ])

    const bgSrc = await toDataUrl(join(process.cwd(), 'public/images/og.png'), 'image/png')
    const avatarSrc = await toDataUrl(join(process.cwd(), 'public/avatars/choneas.png'), 'image/png')

    const formattedDate = new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(new Date(metadata.created_time || Date.now()))

    const footerText = `${formattedDate} · ${metadata.readingTime || 'Unknown time'}`

    // Fetch cover as base64 data URL to avoid Satori fetch timeout
    const coverSrc = metadata.cover ? await fetchRemoteAsDataUrl(metadata.cover) : null

    return new ImageResponse(
        (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: 40,
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'black',
                }}
            >
                {/* Background image */}
                <div style={{ display: 'flex', position: 'absolute', left: 0, top: 0, width: 1200, height: 630 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={bgSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                </div>

                {/* Header: avatar + site name + path */}
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={avatarSrc} style={{ width: 56, height: 56, borderRadius: 28, objectFit: 'cover', flexShrink: 0 }} alt="" />
                    <div style={{ display: 'flex', flexDirection: 'column', fontFamily: 'Google Sans Code', fontWeight: 700, color: 'white', lineHeight: 1 }}>
                        <span style={{ fontSize: 28 }}>{tm('name')}</span>
                        <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.75)', marginTop: 6 }}>/article/{slug}</span>
                    </div>
                </div>

                {/* Body: title + description + cover */}
                <div style={{ display: 'flex', flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: 0 }}>
                    <div style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: 16, justifyContent: 'center', color: 'white', paddingRight: coverSrc ? 40 : 0 }}>
                        <span style={{ fontFamily: 'Noto Serif SC', fontWeight: 700, fontSize: coverSrc ? 52 : 64, lineHeight: 1.15, width: coverSrc ? 580 : 1000, overflow: 'hidden', textOverflow: 'ellipsis', maxHeight: coverSrc ? 188 : 220, display: 'flex' }}>
                            {metadata.title}
                        </span>
                        {metadata.description && (
                            <span style={{ fontFamily: 'Noto Serif SC', fontWeight: 500, fontSize: coverSrc ? 18 : 24, opacity: 0.6, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', maxHeight: coverSrc ? 74 : 100, display: 'flex', width: coverSrc ? 557 : 900 }}>
                                {metadata.description}
                            </span>
                        )}
                    </div>

                    {coverSrc && (
                        // Satori does not clip children with overflow:hidden on border-radius, apply radius directly on img
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img alt={'cover'} src={coverSrc} style={{ width: 504, height: 306, borderRadius: 24, objectFit: 'cover', flexShrink: 0 }} />
                    )}
                </div>

                {/* Footer: date + reading time */}
                <div style={{ display: 'flex', fontFamily: 'Google Sans Code', fontWeight: 700, fontSize: 24, color: 'white', opacity: 0.8 }}>
                    {footerText}
                </div>
            </div>
        ),
        {
            ...OG_SIZE,
            fonts: [
                { name: 'Noto Serif SC', data: notoSerifMedium, style: 'normal', weight: 500 },
                { name: 'Noto Serif SC', data: notoSerifBold, style: 'normal', weight: 700 },
                { name: 'Google Sans Code', data: googleSansCodeData, style: 'normal', weight: 700 },
            ],
        }
    )
}
