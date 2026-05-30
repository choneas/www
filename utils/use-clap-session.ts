'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { getCookie, setCookie } from './actions-cookie'

const MAX_CLAPS = 25

export function useClapSession(slug: string) {
  const baselineRef = useRef(0)
  const extraRef = useRef(0)
  const cookieCountRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const [displayClaps, setDisplayClaps] = useState(0)
  const [isClapped, setIsClapped] = useState(false)

  useEffect(() => {
    const actions = getCookie()
    const count = actions.clapped[slug] ?? 0
    cookieCountRef.current = count
    if (count > 0) {
      setIsClapped(true)
    }

    fetch(`/api/post/${slug}/stats`)
      .then(r => r.json())
      .then(d => {
        if (typeof d.claps === 'number') {
          baselineRef.current = d.claps
          setDisplayClaps(baselineRef.current + extraRef.current)
        }
      })
      .catch(() => {})
  }, [slug])

  const commitClaps = useCallback(async () => {
    const extra = extraRef.current
    if (extra <= 0) return

    const n = Math.min(extra, Math.max(0, MAX_CLAPS - cookieCountRef.current))
    if (n <= 0) {
      setDisplayClaps(baselineRef.current + extraRef.current)
      return
    }

    const prevDisplay = baselineRef.current + extra
    extraRef.current = 0

    try {
      const res = await fetch(`/api/post/${slug}/clap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ n }),
      })
      if (res.ok) {
        const data = await res.json()
        baselineRef.current = data.claps
        cookieCountRef.current = data.userClaps
        const actions = getCookie()
        actions.clapped[slug] = data.userClaps
        setCookie(actions)
      }
    } catch {}

    extraRef.current = Math.max(0, prevDisplay - baselineRef.current)
    setDisplayClaps(baselineRef.current + extraRef.current)
  }, [slug])

  const handleClap = useCallback(() => {
    setIsClapped(true)
    extraRef.current += 1
    setDisplayClaps(baselineRef.current + extraRef.current)

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    timerRef.current = setTimeout(() => {
      commitClaps()
    }, 5000)
  }, [commitClaps])

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        commitClaps()
      }
    }
  }, [commitClaps])

  return {
    displayClaps,
    isClapped,
    handleClap,
  }
}
