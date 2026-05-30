import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { recordView, detectDevice, processReferrer } from '@/utils/redis-interactions'

export async function POST(request: Request) {
    const body = await request.json().catch(() => ({}))
    const slug = typeof body.slug === 'string' ? body.slug.trim() : ''

    if (!slug) {
        return NextResponse.json({ error: 'slug is required' }, { status: 400 })
    }

    const headersList = await headers()
    const ua = headersList.get('user-agent') ?? ''
    const referer = headersList.get('referer')
    const acceptLang = headersList.get('accept-language')
    const country = headersList.get('x-vercel-ip-country') ?? headersList.get('cf-ipcountry')
    const host = headersList.get('host')

    const { d, device } = detectDevice(ua)
    const ref = processReferrer(referer, host)
    const lang = acceptLang?.split(',')[0]?.split(';')[0]?.trim() || undefined
    const c = country?.toUpperCase() || undefined

    const views = await recordView(slug, {
        t: Math.floor(Date.now() / 1000),
        type: 'view',
        ...(ref !== undefined && { ref }),
        ...(c !== undefined && { c }),
        ...(d !== undefined && { d }),
        ...(device !== undefined && { device }),
        ...(lang !== undefined && { lang }),
    })

    return NextResponse.json({ views })
}
