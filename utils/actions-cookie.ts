const COOKIE_NAME = 'actions'
const MAX_AGE = 31536000

export interface ActionsCookie {
  clapped: Record<string, number>
}

export function getCookie(): ActionsCookie {
  if (typeof document === 'undefined') return { clapped: {} }
  try {
    const raw = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`))?.[1]
    if (!raw) return { clapped: {} }
    return JSON.parse(decodeURIComponent(raw))
  } catch {
    return { clapped: {} }
  }
}

export function setCookie(data: ActionsCookie): void {
  if (typeof document === 'undefined') return
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(data))}; path=/; max-age=${MAX_AGE}; SameSite=Lax`
}

export function decodeValue(raw: string | undefined): ActionsCookie {
  if (!raw) return { clapped: {} }
  try {
    return JSON.parse(raw)
  } catch {}
  try {
    return JSON.parse(decodeURIComponent(raw))
  } catch {
    return { clapped: {} }
  }
}

export function encodeValue(data: ActionsCookie): string {
  return JSON.stringify(data)
}
