import redis from '@/lib/redis'

// ============================================================================
// Types
// ============================================================================

export interface ViewEvent {
    t: number
    type: 'view'
    ref?: string
    c?: string
    d?: 'm' | 'd' | 't'
    device?: string
    lang?: string
}

export interface ClapEvent {
    t: number
    type: 'clap'
    n: number
}

export type EventRecord = ViewEvent | ClapEvent

export interface StatsResult {
    slug: string
    views: number
    claps: number
}

export interface TrendResult {
    slug: string
    views: Record<string, number>
    claps: Record<string, number>
}

// ============================================================================
// Key builders
// ============================================================================

function buildKeys(slug: string) {
    return {
        views: `blog:${slug}:views`,
        claps: `blog:${slug}:claps`,
        viewsDaily: `blog:${slug}:views:daily`,
        clapsDaily: `blog:${slug}:claps:daily`,
        events: `blog:${slug}:events`,
    }
}

// ============================================================================
// Date helper (YYYYMMDD in UTC, per spec)
// ============================================================================

function getDailyDate(): string {
    const d = new Date()
    const y = d.getUTCFullYear()
    const m = String(d.getUTCMonth() + 1).padStart(2, '0')
    const day = String(d.getUTCDate()).padStart(2, '0')
    return `${y}${m}${day}`
}

// ============================================================================
// Event builder (filters out undefined/null/empty fields)
// ============================================================================

function buildEvent(fields: Record<string, unknown>): string {
    const filtered: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(fields)) {
        if (v !== undefined && v !== null && v !== '') {
            filtered[k] = v
        }
    }
    return JSON.stringify(filtered)
}

// ============================================================================
// Device detection from User-Agent
// ============================================================================

export function detectDevice(ua: string): { d: 'm' | 'd' | 't'; device?: string } {
    if (/iPhone/i.test(ua)) {
        const m = ua.match(/iPhone OS (\d+)[_.](\d+)/i)
        return { d: 'm', device: m ? `iPhone, iOS ${m[1]}.${m[2]}` : 'iPhone' }
    }

    if (/iPad/i.test(ua)) {
        const m = ua.match(/CPU OS (\d+)[_.](\d+)/i)
        return { d: 't', device: m ? `iPad, iPadOS ${m[1]}.${m[2]}` : 'iPad' }
    }

    if (/Android/i.test(ua)) {
        const osMatch = ua.match(/Android ([\d.]+)/i)
        const version = osMatch ? osMatch[1] : ''

        const modelChunk = ua.match(/Android [\d.]+;\s*([^;)]+)/)
        let model = ''
        if (modelChunk) {
            const raw = modelChunk[1].trim().replace(/\s*(?:Build|wv)\/.*$/, '').trim()
            if (raw && !/^[a-z]{2}(-[A-Z]{2})?$/i.test(raw) && !/^(?:Mobile|WAP)$/i.test(raw)) {
                model = raw
            }
        }

        const isMobile = /Mobile/i.test(ua)
        const isTablet = /Tablet/i.test(ua)
        const parts = [model, version ? `Android ${version}` : ''].filter(Boolean)

        return {
            d: isTablet ? 't' : isMobile ? 'm' : 't',
            device: parts.length > 0 ? parts.join(', ') : undefined,
        }
    }

    if (/Macintosh|Mac OS X/i.test(ua)) {
        const m = ua.match(/Mac OS X (\d+[_\d.]*)/i)
        const version = m ? m[1].replace(/_/g, '.') : ''
        return { d: 'd', device: `macOS ${version}` }
    }

    if (/Windows/i.test(ua)) {
        const m = ua.match(/Windows NT ([\d.]+)/i)
        return { d: 'd', device: m ? `Windows, NT ${m[1]}` : 'Windows' }
    }

    if (/Linux/i.test(ua)) {
        return { d: 'd', device: 'Linux' }
    }

    return { d: 'd' }
}

// ============================================================================
// Referrer processing
// ============================================================================

export function processReferrer(ref: string | null, ownHost: string | null): string | undefined {
    if (!ref) return undefined

    try {
        const url = new URL(ref)

        if (ownHost) {
            const normalizedOwn = ownHost.replace(/^www\./, '')
            const normalizedRef = url.hostname.replace(/^www\./, '')
            if (normalizedRef === normalizedOwn) {
                return url.pathname
            }
        }

        return ref.replace(/^https?:\/\/(www\.)?/, '')
    } catch {
        return undefined
    }
}

// ============================================================================
// Redis operations
// ============================================================================

export async function recordView(slug: string, event: ViewEvent): Promise<number> {
    if (!redis) return 0

    const keys = buildKeys(slug)
    const date = getDailyDate()
    const json = buildEvent(event as unknown as Record<string, unknown>)

    const [views] = await Promise.all([
        redis.incr(keys.views),
        redis.hincrby(keys.viewsDaily, date, 1),
        redis.lpush(keys.events, json),
    ])

    return views
}

export async function recordClap(slug: string, n: number): Promise<number> {
    if (!redis) return 0

    const keys = buildKeys(slug)
    const date = getDailyDate()
    const event = buildEvent({ t: Math.floor(Date.now() / 1000), type: 'clap', n })

    const [claps] = await Promise.all([
        redis.incrby(keys.claps, n),
        redis.hincrby(keys.clapsDaily, date, n),
        redis.lpush(keys.events, event),
    ])

    return claps
}

export async function getStats(slug: string): Promise<StatsResult> {
    if (!redis) {
        return { slug, views: 0, claps: 0 }
    }

    const keys = buildKeys(slug)
    const [views, claps] = await Promise.all([
        redis.get<string>(keys.views),
        redis.get<string>(keys.claps),
    ])

    return {
        slug,
        views: parseInt(views ?? '0', 10),
        claps: parseInt(claps ?? '0', 10),
    }
}

export async function getTrend(slug: string): Promise<TrendResult> {
    if (!redis) {
        return { slug, views: {}, claps: {} }
    }

    const keys = buildKeys(slug)
    const [views, claps] = await Promise.all([
        redis.hgetall<Record<string, string>>(keys.viewsDaily),
        redis.hgetall<Record<string, string>>(keys.clapsDaily),
    ])

    const parseHash = (raw: Record<string, string> | null): Record<string, number> => {
        if (!raw) return {}
        const result: Record<string, number> = {}
        for (const [k, v] of Object.entries(raw)) {
            result[k] = parseInt(v, 10)
        }
        return result
    }

    return {
        slug,
        views: parseHash(views),
        claps: parseHash(claps),
    }
}
