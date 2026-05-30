const DEBUG_COOKIES = ['_vercel_jwt', '__next_hmr_refresh_hash__']

function isDebug(): boolean {
  if (typeof document === 'undefined') return true
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') return true
  return DEBUG_COOKIES.some(k => document.cookie.includes(k))
}

function isForced(): boolean {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).get('force_view') === '1'
}

export async function trackView(slug: string): Promise<number | null> {
  if (!isForced() && isDebug()) {
    console.log('[trackView] skip', slug)
    return null
  }
  try {
    const res = await fetch('/api/post/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    })
    if (!res.ok) throw new Error(`${res.status}`)
    const data = await res.json()
    console.log('[trackView] ok', slug, data.views)
    return data.views
  } catch (e) {
    console.error('[trackView] fail', slug, e)
    return null
  }
}
