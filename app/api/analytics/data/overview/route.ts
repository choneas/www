import { NextResponse } from 'next/server'
import { getAnalyticsData } from '@/lib/analytics/aggregate'

export async function GET() {
    try {
        const data = await getAnalyticsData()
        if (!data) {
            return NextResponse.json({ error: 'Redis not configured' }, { status: 500 })
        }
        return NextResponse.json(data, {
            headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' },
        })
    } catch {
        return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 })
    }
}
