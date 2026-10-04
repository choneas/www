'use client'

import { useEffect, useState } from 'react'

const _cache: Record<string, number> = {}

export function useViewCount(slug: string | undefined | null): number | null {
  const [views, setViews] = useState<number | null>(() =>
    slug && _cache[slug] != null ? _cache[slug] : null
  )

  useEffect(() => {
    if (!slug) return
    if (_cache[slug] != null) {
      setViews(_cache[slug])
      return
    }
    fetch(`/api/post/${encodeURIComponent(slug)}/stats`)
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        const v = d?.views ?? 0
        _cache[slug] = v
        setViews(v)
      })
      .catch(() => {
        _cache[slug] = 0
        setViews(0)
      })
  }, [slug])

  return views
}
