import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { password } = await request.json()

        if (!password || typeof password !== 'string') {
            return NextResponse.json({ ok: false }, { status: 400 })
        }

        const envPassword = process.env.ANALYTICS_PASSWORD
        if (!envPassword) {
            return NextResponse.json({ ok: false, error: 'Server not configured' }, { status: 500 })
        }

        if (password === envPassword) {
            return NextResponse.json({ ok: true })
        }

        return NextResponse.json({ ok: false }, { status: 401 })
    } catch {
        return NextResponse.json({ ok: false }, { status: 400 })
    }
}
