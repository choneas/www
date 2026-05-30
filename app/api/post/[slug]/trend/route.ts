import { NextResponse } from 'next/server'
import { getTrend } from '@/utils/redis-interactions'

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params
    const trend = await getTrend(slug)
    return NextResponse.json(trend)
}
