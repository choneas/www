# Blog Interaction & Stats System — Implementation Spec

## Overview

A lightweight blog interaction system built on Upstash Redis.
Tracks views and claps per article (identified by `slug`).
No authentication, no user accounts.

---

## Redis Key Schema

All keys follow the pattern: `blog:{slug}:{type}`

| Key | Redis Type | Description |
|-----|-----------|-------------|
| `blog:{slug}:views` | String (int) | Total view count |
| `blog:{slug}:claps` | String (int) | Total clap count |
| `blog:{slug}:views:daily` | Hash | Field = `"YYYYMMDD"`, Value = count |
| `blog:{slug}:claps:daily` | Hash | Field = `"YYYYMMDD"`, Value = count |
| `blog:{slug}:events` | List | All events, newest at head (LPUSH), never trimmed |

---

## Event Record Format

Each event is a JSON string pushed into `blog:{slug}:events`.

### View event
```json
{
  "t": 1716432000,
  "type": "view",
  "ref": "google.com/search?q=toilet+pc",
  "c": "CN",
  "d": "m",
  "lang": "zh-CN"
}
```

### Clap event
```json
{
  "t": 1716432001,
  "type": "clap",
  "n": 7
}
```

### Field reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `t` | Unix timestamp (int) | Yes | Event time in seconds |
| `type` | `"view"` \| `"clap"` | Yes | Event type |
| `ref` | string | No | Processed referrer (see rules below) |
| `c` | string | No | ISO 3166-1 alpha-2 country code, e.g. `"CN"` |
| `d` | `"m"` \| `"d"` \| `"t"` | No | Device: mobile / desktop / tablet |
| `lang` | string | No | Browser language, e.g. `"zh-CN"` |
| `n` | int | clap only | Number of claps in this session |

### `ref` field processing rules

Given the raw `Referer` header value:

1. If referrer origin matches the blog's own origin →
   store only the **pathname** (e.g. `/posts/set-up-a-toilet-pc`)

2. Otherwise → strip leading `https://www.` or `http://www.` prefix,
   keep everything after (e.g. `google.com/search?q=foo`)

3. If referrer is empty or absent → omit the `ref` field entirely

```
"https://www.google.com/search?q=foo"  →  "google.com/search?q=foo"
"https://www.choneas.com/posts/abc"    →  "/posts/abc"
"https://choneas.com/"                 →  "/"
"https://t.co/xxxxx"                   →  "t.co/xxxxx"
(empty)                                →  omit field
```

---

## API Endpoints

### POST /api/view

Record a page view.

**Request body:**
```json
{
  "slug": "set-up-a-toilet-pc",
  "ref": "google.com/search?q=foo",
  "c": "CN",
  "d": "m",
  "lang": "zh-CN"
}
```
- `slug` is required; all other fields are optional.
- `ref` should already be processed by the rules above before sending,
  OR the server can accept the raw `Referer` header and process it server-side.
  Prefer server-side processing.

**Server actions (atomic where possible):**
1. `INCR blog:{slug}:views`
2. `HINCRBY blog:{slug}:views:daily {YYYYMMDD} 1`
3. `LPUSH blog:{slug}:events {JSON}`
    - JSON contains `t`, `type: "view"`, and any provided optional fields
    - Omit fields that are absent

**Response:**
```json
{ "views": 123 }
```

---

### POST /api/clap

Record a clap session result.

**Request body:**
```json
{
  "slug": "set-up-a-toilet-pc",
  "n": 7
}
```
- `n` is the number of claps in this session (integer, 1–25).
- No deduplication. Server trusts the client entirely.
- Frontend is responsible for enforcing the max (25) and the session window (5s countdown).

**Server actions:**
1. `INCRBY blog:{slug}:claps {n}`
2. `HINCRBY blog:{slug}:claps:daily {YYYYMMDD} {n}`
3. `LPUSH blog:{slug}:events {JSON}`
    - JSON: `{ "t": ..., "type": "clap", "n": 7 }`

**Response:**
```json
{ "claps": 456 }
```

---

### GET /api/stats?slug={slug}

Fetch totals for a single article.

**Response:**
```json
{
  "slug": "set-up-a-toilet-pc",
  "views": 123,
  "claps": 456
}
```

**Server actions:**
1. `GET blog:{slug}:views`
2. `GET blog:{slug}:claps`

---

### GET /api/trend?slug={slug}

Fetch daily trend data for a single article.

**Response:**
```json
{
  "slug": "set-up-a-toilet-pc",
  "views": {
    "20250520": 42,
    "20250521": 17,
    "20250523": 61
  },
  "claps": {
    "20250520": 5,
    "20250523": 12
  }
}
```

**Server actions:**
1. `HGETALL blog:{slug}:views:daily`
2. `HGETALL blog:{slug}:claps:daily`

---

## Implementation Notes

- **No event trimming.** `blog:{slug}:events` is never trimmed.
  The site has very low traffic; the list can grow indefinitely within Redis limits.

- **Date format.** Use `YYYYMMDD` (e.g. `"20250523"`) as Hash field keys.
  Generate from server time (UTC or a fixed timezone — pick one and be consistent).

- **Clap trust model.** The server does not validate `n` beyond basic sanity
  (reject if `n < 1` or `n > 25` or non-integer). No session tracking,
  no IP deduplication, no cookie checking on the server side.

- **Country detection.** Derive `c` from the request IP on the server side
  (e.g. using a GeoIP library or a Cloudflare/Vercel header like `CF-IPCountry`
  or `x-vercel-ip-country`). Do not rely on the client to send this.

- **Device detection.** Derive `d` from `User-Agent` on the server side.
  Simple heuristic: check for mobile/tablet keywords. Return `"m"`, `"d"`, or `"t"`.

- **Future action types.** To add a new action (e.g. `bookmark`):
    - Add `blog:{slug}:bookmarks` counter
    - Add `blog:{slug}:bookmarks:daily` Hash
    - Add new `"type": "bookmark"` event to the shared `events` list
    - No structural changes needed to existing keys

- **Future event fields.** Add new fields to the JSON object in `events`.
  Old records simply won't have those fields. Read code should handle missing fields gracefully.