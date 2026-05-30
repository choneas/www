import { NextRequest, NextResponse } from 'next/server'
import { getRawEvents } from '@/lib/analytics/aggregate'

export async function GET(request: NextRequest) {
    try {
        const slug = request.nextUrl.searchParams.get('slug') || undefined
        const limit = parseInt(request.nextUrl.searchParams.get('limit') || '100', 10)
        const events = await getRawEvents(slug, limit)
        return NextResponse.json({ events })
    } catch {
        return NextResponse.json({ error: 'Failed to load events' }, { status: 500 })
    }
}
