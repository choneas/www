import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { recordClap } from '@/utils/redis-interactions'
import { decodeValue, encodeValue } from '@/utils/actions-cookie'

const MAX_CLAPS = 25

export async function POST(request: Request) {
    const body = await request.json().catch(() => ({}))
    const slug = typeof body.slug === 'string' ? body.slug.trim() : ''
    const n = typeof body.n === 'number' ? body.n : NaN

    if (!slug) {
        return NextResponse.json({ error: 'slug is required' }, { status: 400 })
    }

    if (!Number.isInteger(n) || n < 1 || n > MAX_CLAPS) {
        return NextResponse.json(
            { error: `n must be an integer between 1 and ${MAX_CLAPS}` },
            { status: 400 }
        )
    }

    const cookieStore = await cookies()
    const actions = decodeValue(cookieStore.get('actions')?.value)
    const prev = actions.clapped[slug] ?? 0

    if (n <= prev) {
        return NextResponse.json({ error: 'n must be greater than previous count' }, { status: 400 })
    }

    const delta = Math.min(n, MAX_CLAPS) - prev
    if (delta <= 0) {
        return NextResponse.json({ error: 'no new claps to record' }, { status: 400 })
    }

    const claps = await recordClap(slug, delta)
    const userClaps = prev + delta

    actions.clapped[slug] = userClaps
    const res = NextResponse.json({ claps, userClaps })
    res.cookies.set('actions', encodeValue(actions), {
        path: '/',
        maxAge: 31536000,
        sameSite: 'lax',
    })

    return res
}
