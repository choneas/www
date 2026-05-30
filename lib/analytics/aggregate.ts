import redis from '@/lib/redis'
import type { EventRecord } from '@/utils/redis-interactions'

const BLOG_SUPPORTED_LANGS = ["zh-CN", "zh", "en"]

function parseEvents(raw: string[]): EventRecord[] {
    return raw.map((s) => {
        try { return JSON.parse(s) as EventRecord }
        catch { return null }
    }).filter(Boolean) as EventRecord[]
}

function getTodayDate(): string {
    const d = new Date()
    const y = d.getUTCFullYear()
    const m = String(d.getUTCMonth() + 1).padStart(2, '0')
    const day = String(d.getUTCDate()).padStart(2, '0')
    return `${y}${m}${day}`
}

function categorizeReferrer(ref: string): string {
    if (!ref || ref.startsWith('/')) return 'internal'
    const searchEngines = ['google', 'bing', 'baidu', 'duckduckgo', 'yahoo', 'yandex']
    const social = ['t.co', 'twitter', 'x.com', 'weibo', 'instagram', 'facebook', 'reddit', 'bsky.app', 'linkedin']
    const lower = ref.toLowerCase()
    if (searchEngines.some((s) => lower.includes(s))) return 'search'
    if (social.some((s) => lower.includes(s))) return 'social'
    return 'external'
}

function parseHash(raw: Record<string, string> | null): Record<string, number> {
    if (!raw) return {}
    const result: Record<string, number> = {}
    for (const [k, v] of Object.entries(raw)) {
        result[k] = parseInt(v, 10)
    }
    return result
}

export interface ArticleData {
    slug: string
    views: number
    claps: number
    clapRate: number
    firstSeen: number | null
    lastSeen: number | null
}

export interface AnalyticsData {
    totalViews: number
    totalClaps: number
    totalArticles: number
    avgViewsPerArticle: number
    avgClapsPerArticle: number
    clapRate: number
    viewsToday: number
    clapsToday: number
    topByViews: { slug: string; views: number; claps: number }[]
    topByClaps: { slug: string; views: number; claps: number }[]
    topByClapRate: { slug: string; clapRate: number; views: number }[]
    articles: ArticleData[]
    countryMap: Record<string, number>
    languageMap: Record<string, number>
    languageMatch: { matched: number; unmatched: number; breakdown: Record<string, number> }
    deviceMap: { m: number; d: number; t: number }
    referrerMap: Record<string, number>
    referrerCategories: Record<string, number>
    hourlyDistribution: number[]
    weekdayDistribution: number[]
    recentEvents: EventRecord[]
    clapSessionSizes: Record<number, number>
}

export async function getAnalyticsData(): Promise<AnalyticsData | null> {
    if (!redis) return null

    // Use SCAN instead of KEYS (Upstash REST compatible)
    const foundSlugs = new Set<string>()
    let cursor = 0
    do {
        const [nextCursor, keys] = await redis.scan(cursor, { match: 'blog:*:views', count: 100 })
        cursor = nextCursor
        for (const k of keys) {
            const match = k.match(/^blog:(.+):views$/)
            if (match) foundSlugs.add(match[1])
        }
    } while (cursor !== 0)

    const slugs = [...foundSlugs]

    if (slugs.length === 0) {
        return {
            totalViews: 0, totalClaps: 0, totalArticles: 0,
            avgViewsPerArticle: 0, avgClapsPerArticle: 0, clapRate: 0,
            viewsToday: 0, clapsToday: 0,
            topByViews: [], topByClaps: [], topByClapRate: [],
            articles: [],
            countryMap: {}, languageMap: {},
            languageMatch: { matched: 0, unmatched: 0, breakdown: {} },
            deviceMap: { m: 0, d: 0, t: 0 },
            referrerMap: {}, referrerCategories: {},
            hourlyDistribution: new Array(24).fill(0),
            weekdayDistribution: new Array(7).fill(0),
            recentEvents: [],
            clapSessionSizes: {},
        }
    }

    const today = getTodayDate()
    const articles: ArticleData[] = []
    const allEvents: EventRecord[] = []

    for (const slug of slugs) {
        const viewsKey = `blog:${slug}:views`
        const clapsKey = `blog:${slug}:claps`
        const eventsKey = `blog:${slug}:events`

        const [viewsRaw, clapsRaw, eventsRaw] = await Promise.all([
            redis.get<string>(viewsKey),
            redis.get<string>(clapsKey),
            redis.lrange(eventsKey, 0, 500),
        ])

        const views = parseInt(viewsRaw ?? '0', 10)
        const claps = parseInt(clapsRaw ?? '0', 10)
        const clapRate = views > 0 ? (claps / views) * 100 : 0

        const events = parseEvents(eventsRaw)
        allEvents.push(...events)

        let firstSeen: number | null = null
        let lastSeen: number | null = null
        for (const e of events) {
            if (firstSeen === null || e.t < firstSeen) firstSeen = e.t
            if (lastSeen === null || e.t > lastSeen) lastSeen = e.t
        }

        articles.push({ slug, views, claps, clapRate, firstSeen, lastSeen })
    }

    const totalViews = articles.reduce((s, a) => s + a.views, 0)
    const totalClaps = articles.reduce((s, a) => s + a.claps, 0)
    const totalArticles = articles.length
    const avgViewsPerArticle = totalArticles > 0 ? Math.round(totalViews / totalArticles) : 0
    const avgClapsPerArticle = totalArticles > 0 ? Math.round(totalClaps / totalArticles) : 0
    const clapRate = totalViews > 0 ? (totalClaps / totalViews) * 100 : 0

    let viewsToday = 0
    let clapsToday = 0
    for (const slug of slugs) {
        const vDaily = await redis.hget<string>(`blog:${slug}:views:daily`, today)
        const cDaily = await redis.hget<string>(`blog:${slug}:claps:daily`, today)
        viewsToday += parseInt(vDaily ?? '0', 10)
        clapsToday += parseInt(cDaily ?? '0', 10)
    }

    const topByViews = [...articles].sort((a, b) => b.views - a.views).slice(0, 10)
    const topByClaps = [...articles].sort((a, b) => b.claps - a.claps).slice(0, 10)
    const topByClapRate = [...articles].filter((a) => a.views >= 10).sort((a, b) => b.clapRate - a.clapRate).slice(0, 10)

    const countryMap: Record<string, number> = {}
    const languageMap: Record<string, number> = {}
    const deviceMap = { m: 0, d: 0, t: 0 }
    const referrerMap: Record<string, number> = {}
    const referrerCategories: Record<string, number> = {}
    const hourlyDistribution = new Array(24).fill(0)
    const weekdayDistribution = new Array(7).fill(0)
    const clapSessionSizes: Record<number, number> = {}

    for (const e of allEvents) {
        if (e.type === 'view') {
            if (e.c) countryMap[e.c] = (countryMap[e.c] || 0) + 1
            if (e.lang) languageMap[e.lang] = (languageMap[e.lang] || 0) + 1
            if (e.d) deviceMap[e.d]++
            if (e.ref) {
                referrerMap[e.ref] = (referrerMap[e.ref] || 0) + 1
                const cat = categorizeReferrer(e.ref)
                referrerCategories[cat] = (referrerCategories[cat] || 0) + 1
            }
            const d = new Date(e.t * 1000)
            hourlyDistribution[d.getUTCHours()]++
            weekdayDistribution[d.getUTCDay()]++
        } else {
            clapSessionSizes[e.n] = (clapSessionSizes[e.n] || 0) + 1
        }
    }

    let matched = 0
    let unmatched = 0
    for (const [lang, count] of Object.entries(languageMap)) {
        const primary = lang.split('-')[0]
        if (BLOG_SUPPORTED_LANGS.some((s) => s === lang || s === primary)) {
            matched += count
        } else {
            unmatched += count
        }
    }

    const recentEvents = allEvents.sort((a, b) => b.t - a.t).slice(0, 100)

    return {
        totalViews, totalClaps, totalArticles,
        avgViewsPerArticle, avgClapsPerArticle, clapRate,
        viewsToday, clapsToday,
        topByViews: topByViews.map((a) => ({ slug: a.slug, views: a.views, claps: a.claps })),
        topByClaps: topByClaps.map((a) => ({ slug: a.slug, views: a.views, claps: a.claps })),
        topByClapRate: topByClapRate.map((a) => ({ slug: a.slug, clapRate: a.clapRate, views: a.views })),
        articles: articles.sort((a, b) => b.views - a.views),
        countryMap, languageMap,
        languageMatch: { matched, unmatched, breakdown: languageMap },
        deviceMap, referrerMap, referrerCategories,
        hourlyDistribution, weekdayDistribution,
        recentEvents,
        clapSessionSizes,
    }
}

export async function getTrendData(slug: string, from?: string, to?: string) {
    if (!redis) return { slug, days: [] }

    const viewsDaily = parseHash(await redis.hgetall<Record<string, string>>(`blog:${slug}:views:daily`))
    const clapsDaily = parseHash(await redis.hgetall<Record<string, string>>(`blog:${slug}:claps:daily`))

    const allDates = new Set([...Object.keys(viewsDaily), ...Object.keys(clapsDaily)])
    const filtered = [...allDates].filter((d) => {
        if (from && d < from) return false
        if (to && d > to) return false
        return true
    }).sort()

    return {
        slug,
        days: filtered.map((date) => ({
            date,
            views: viewsDaily[date] || 0,
            claps: clapsDaily[date] || 0,
        })),
    }
}

export async function getRawEvents(slug?: string, limit = 100) {
    if (!redis) return []

    if (slug) {
        const raw = await redis.lrange(`blog:${slug}:events`, 0, limit - 1)
        return parseEvents(raw)
    }

    const keys = await redis.keys('blog:*:views')
    const slugSet = new Set<string>()
    for (const k of keys) {
        const match = k.match(/^blog:(.+):views$/)
        if (match) slugSet.add(match[1])
    }

    const allEvents: EventRecord[] = []
    for (const s of slugSet) {
        const raw = await redis.lrange(`blog:${s}:events`, 0, limit - 1)
        allEvents.push(...parseEvents(raw))
    }

    return allEvents.sort((a, b) => b.t - a.t).slice(0, limit)
}
