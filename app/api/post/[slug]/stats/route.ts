import { NextResponse } from 'next/server'
import { getStats } from '@/utils/redis-interactions'

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params
    const stats = await getStats(slug)
    return NextResponse.json(stats)
}
