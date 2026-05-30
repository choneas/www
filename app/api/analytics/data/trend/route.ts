import { NextRequest, NextResponse } from 'next/server'
import { getTrendData } from '@/lib/analytics/aggregate'

export async function GET(request: NextRequest) {
    try {
        const slug = request.nextUrl.searchParams.get('slug')
        const from = request.nextUrl.searchParams.get('from') || undefined
        const to = request.nextUrl.searchParams.get('to') || undefined

        if (!slug) {
            return NextResponse.json({ error: 'slug is required' }, { status: 400 })
        }

        const data = await getTrendData(slug, from, to)
        return NextResponse.json(data)
    } catch {
        return NextResponse.json({ error: 'Failed to load trend' }, { status: 500 })
    }
}
