'use client'

import { useEffect, useRef } from 'react'
import { trackView } from '@/utils/track-view'

export function ViewTracker({ slug }: { slug: string }) {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true
    trackView(slug)
  }, [slug])

  return null
}
