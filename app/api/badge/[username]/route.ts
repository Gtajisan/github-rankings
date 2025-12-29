import { type NextRequest, NextResponse } from "next/server"
import { countries } from "@/lib/countries"
import { getUserDetails, generateMockContributions } from "@/lib/github-api"

const badgeCache = new Map<string, { svg: string; timestamp: number; user?: any }>()
const BADGE_CACHE_TTL = 6 * 60 * 60 * 1000 // 6 hours

// We use the shared `getUserDetails` from `lib/github-api` and then
// augment the user with generated contribution stats so the badge
// shows the same fields as the homepage list.

async function getUserRank(location: string, username: string): Promise<{ rank: number; total: number }> {
  try {
    const query = encodeURIComponent(`location:${location} type:user`)
    const perPage = 100

    const headers: Record<string, string> = { Accept: "application/vnd.github.v3+json" }
    if (process.env.GITHUB_TOKEN) headers.Authorization = `token ${process.env.GITHUB_TOKEN}`

    // Fetch first page to get total_count and check initial results
    const firstResp = await fetch(
      `https://api.github.com/search/users?q=${query}&sort=followers&order=desc&page=1&per_page=${perPage}`,
      { headers, next: { revalidate: 3600 } },
    )

    if (!firstResp.ok) return { rank: 0, total: 0 }

    const firstData = await firstResp.json()
    const total = firstData.total_count || 0

    const idx = firstData.items.findIndex((u: any) => u.login.toLowerCase() === username.toLowerCase())
    if (idx >= 0) return { rank: idx + 1, total }

    // Paginate a few pages if not found on first page (limits to avoid heavy usage)
    const maxPages = Math.min(5, Math.ceil(Math.min(total, 1000) / perPage))
    for (let page = 2; page <= maxPages; page++) {
      try {
        const resp = await fetch(
          `https://api.github.com/search/users?q=${query}&sort=followers&order=desc&page=${page}&per_page=${perPage}`,
          { headers, next: { revalidate: 3600 } },
        )
        if (!resp.ok) break
        const data = await resp.json()
        const found = data.items.findIndex((u: any) => u.login.toLowerCase() === username.toLowerCase())
        if (found >= 0) {
          return { rank: (page - 1) * perPage + found + 1, total }
        }
        if (data.items.length < perPage) break
      } catch {
        break
      }
    }

    return { rank: 0, total }
  } catch {
    return { rank: 0, total: 0 }
  }
}

function detectCountry(location: string | null): { code: string; name: string; flag: string } | null {
  if (!location) return null
  const loc = location.toLowerCase()

  for (const country of countries) {
    if (loc.includes(country.name.toLowerCase())) {
      return { code: country.code, name: country.name, flag: country.flag }
    }
    for (const city of country.cities) {
      if (loc.includes(city.toLowerCase())) {
        return { code: country.code, name: country.name, flag: country.flag }
      }
    }
  }

  // Additional heuristic matching for common cases (state names, aliases)
  const aliases: Record<string, string> = {
    usa: "United States",
    us: "United States",
    "u.s.a": "United States",
    "u.s.": "United States",
    uk: "United Kingdom",
    england: "United Kingdom",
    scotland: "United Kingdom",
    britain: "United Kingdom",
    america: "United States",
    "united states of america": "United States",
    uae: "United Arab Emirates",
  }

  for (const [token, countryName] of Object.entries(aliases)) {
    if (loc.includes(token)) {
      const c = countries.find((c) => c.name === countryName)
      if (c) return { code: c.code, name: c.name, flag: c.flag }
    }
  }

  // Check US state names to map to United States
  const usStates = [
    "alabama",
    "alaska",
    "arizona",
    "arkansas",
    "california",
    "colorado",
    "connecticut",
    "delaware",
    "florida",
    "georgia",
    "hawaii",
    "idaho",
    "illinois",
    "indiana",
    "iowa",
    "kansas",
    "kentucky",
    "louisiana",
    "maine",
    "maryland",
    "massachusetts",
    "michigan",
    "minnesota",
    "mississippi",
    "missouri",
    "montana",
    "nebraska",
    "nevada",
    "new hampshire",
    "new jersey",
    "new mexico",
    "new york",
    "north carolina",
    "north dakota",
    "ohio",
    "oklahoma",
    "oregon",
    "pennsylvania",
    "rhode island",
    "south carolina",
    "south dakota",
    "tennessee",
    "texas",
    "utah",
    "vermont",
    "virginia",
    "washington",
    "west virginia",
    "wisconsin",
    "wyoming",
  ]

  for (const state of usStates) {
    if (loc.includes(state)) {
      const c = countries.find((c) => c.name === "United States")
      if (c) return { code: c.code, name: c.name, flag: c.flag }
    }
  }

  // Also check common two-letter US state abbreviations (e.g. CA, NY, TX)
  const usStateAbbr = [
    "al",
    "ak",
    "az",
    "ar",
    "ca",
    "co",
    "ct",
    "de",
    "fl",
    "ga",
    "hi",
    "id",
    "il",
    "in",
    "ia",
    "ks",
    "ky",
    "la",
    "me",
    "md",
    "ma",
    "mi",
    "mn",
    "ms",
    "mo",
    "mt",
    "ne",
    "nv",
    "nh",
    "nj",
    "nm",
    "ny",
    "nc",
    "nd",
    "oh",
    "ok",
    "or",
    "pa",
    "ri",
    "sc",
    "sd",
    "tn",
    "tx",
    "ut",
    "vt",
    "va",
    "wa",
    "wv",
    "wi",
    "wy",
  ]

  const tokens = loc.split(/[^a-zA-Z0-9]+/).map((t) => t.trim())
  for (const tok of tokens) {
    if (usStateAbbr.includes(tok)) {
      const c = countries.find((c) => c.name === "United States")
      if (c) return { code: c.code, name: c.name, flag: c.flag }
    }
  }

  return null
}

function getRankStyle(rank: number): { color: string; bgColor: string; icon: string } {
  if (rank === 1) return { color: "#FFD700", bgColor: "#422006", icon: "🥇" }
  if (rank === 2) return { color: "#C0C0C0", bgColor: "#1f2937", icon: "🥈" }
  if (rank === 3) return { color: "#CD7F32", bgColor: "#431407", icon: "🥉" }
  if (rank <= 10) return { color: "#22c55e", bgColor: "#052e16", icon: "⭐" }
  if (rank <= 50) return { color: "#3b82f6", bgColor: "#172554", icon: "🔥" }
  if (rank <= 100) return { color: "#8b5cf6", bgColor: "#2e1065", icon: "💎" }
  return { color: "#6b7280", bgColor: "#1f2937", icon: "👨‍💻" }
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
  if (num >= 1000) return (num / 1000).toFixed(1) + "K"
  return num.toString()
}

function generateSVG(
  user: any,
  country: { code: string; name: string; flag: string } | null,
  rank: number,
  total: number,
  theme: "dark" | "light" | "gradient" | "midnight" | "ocean" | "sunset",
  avatarDataUrl?: string,
): string {
  const { color: rankColor, bgColor: rankBgColor } = getRankStyle(rank)
  const displayName = user.name || user.login

  const themes = {
    dark: {
      bg1: "#0d1117",
      bg2: "#161b22",
      border: "#30363d",
      title: "#58a6ff",
      text: "#e6edf3",
      subtext: "#8b949e",
      accent: "#238636",
      cardBg: "#21262d",
    },
    light: {
      bg1: "#ffffff",
      bg2: "#f6f8fa",
      border: "#d0d7de",
      title: "#0969da",
      text: "#1f2328",
      subtext: "#656d76",
      accent: "#1a7f37",
      cardBg: "#f6f8fa",
    },
    gradient: {
      bg1: "#1a1a2e",
      bg2: "#16213e",
      border: "#6366f1",
      title: "#a5b4fc",
      text: "#e0e7ff",
      subtext: "#94a3b8",
      accent: "#818cf8",
      cardBg: "#1e1e3f",
    },
    midnight: {
      bg1: "#0f0f1a",
      bg2: "#1a1a2e",
      border: "#2d2d44",
      title: "#c4b5fd",
      text: "#e2e8f0",
      subtext: "#94a3b8",
      accent: "#7c3aed",
      cardBg: "#1e1e30",
    },
    ocean: {
      bg1: "#0c1929",
      bg2: "#0f2744",
      border: "#1e4976",
      title: "#38bdf8",
      text: "#e0f2fe",
      subtext: "#7dd3fc",
      accent: "#0ea5e9",
      cardBg: "#0d2847",
    },
    sunset: {
      bg1: "#1a0a0a",
      bg2: "#2d1515",
      border: "#7c2d12",
      title: "#fb923c",
      text: "#fff7ed",
      subtext: "#fdba74",
      accent: "#ea580c",
      cardBg: "#2a1010",
    },
  }

  const t = themes[theme]
  const countryName = country ? country.name : "Unknown"
  const countryFlag = country ? country.flag : "🌍"
  const rankText = rank > 0 ? `#${rank}` : "N/A"
  const totalText = rank > 0 ? `of ${formatNumber(total)}` : ""

  return `
<svg width="495" height="195" viewBox="0 0 495 195" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${t.bg1}"/>
      <stop offset="100%" style="stop-color:${t.bg2}"/>
    </linearGradient>
    <linearGradient id="rankGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${rankColor};stop-opacity:0.8"/>
      <stop offset="100%" style="stop-color:${rankColor};stop-opacity:0.4"/>
    </linearGradient>
    <linearGradient id="shine" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:white;stop-opacity:0.1"/>
      <stop offset="50%" style="stop-color:white;stop-opacity:0"/>
      <stop offset="100%" style="stop-color:white;stop-opacity:0.05"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000" flood-opacity="0.25"/>
    </filter>
    <clipPath id="avatarClip">
      <circle cx="70" cy="85" r="40"/>
    </clipPath>
  </defs>
  
  <!-- Main Card -->
  <rect x="0.5" y="0.5" width="494" height="194" rx="12" fill="url(#bgGradient)" stroke="${t.border}" stroke-width="1"/>
  <rect x="0.5" y="0.5" width="494" height="194" rx="12" fill="url(#shine)"/>
  
  <!-- Avatar with ring -->
  <circle cx="70" cy="85" r="44" fill="${t.cardBg}" filter="url(#shadow)"/>
  <circle cx="70" cy="85" r="42" fill="${t.border}" stroke="${rankColor}" stroke-width="2"/>
  <image href="${avatarDataUrl || user.avatar_url}" x="30" y="45" width="80" height="80" clip-path="url(#avatarClip)" preserveAspectRatio="xMidYMid slice"/>
  
  <!-- User Info -->
  <text x="130" y="50" fill="${t.title}" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif" font-size="20" font-weight="700">
    ${displayName.length > 22 ? displayName.slice(0, 22) + "..." : displayName}
  </text>
  <text x="130" y="72" fill="${t.subtext}" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif" font-size="13">
    @${user.login}
  </text>
  
  <!-- Country Badge -->
  <rect x="130" y="82" width="${Math.min(countryName.length * 8 + 40, 160)}" height="26" rx="13" fill="${t.cardBg}" stroke="${t.border}" stroke-width="1"/>
  <text x="145" y="100" fill="${t.text}" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif" font-size="13">
    ${countryFlag} ${countryName}
  </text>
  
  <!-- Rank Badge -->
  <rect x="130" y="116" width="110" height="32" rx="8" fill="${rankBgColor}" stroke="${rankColor}" stroke-width="1.5"/>
  <text x="145" y="138" fill="${rankColor}" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif" font-size="16" font-weight="700">
    ${rankText}
  </text>
  <text x="185" y="138" fill="${t.subtext}" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif" font-size="12">
    ${totalText}
  </text>
  
  <!-- Stats Cards -->
  <g transform="translate(320, 35)">
    <!-- Followers -->
    <rect x="0" y="0" width="75" height="60" rx="8" fill="${t.cardBg}" stroke="${t.border}" stroke-width="1"/>
    <text x="37.5" y="25" fill="${t.subtext}" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif" font-size="10" text-anchor="middle" font-weight="500">FOLLOWERS</text>
    <text x="37.5" y="47" fill="${t.text}" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif" font-size="18" text-anchor="middle" font-weight="700">${formatNumber(user.followers)}</text>
    
    <!-- Repos -->
    <rect x="85" y="0" width="75" height="60" rx="8" fill="${t.cardBg}" stroke="${t.border}" stroke-width="1"/>
    <text x="122.5" y="25" fill="${t.subtext}" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif" font-size="10" text-anchor="middle" font-weight="500">REPOS</text>
    <text x="122.5" y="47" fill="${t.text}" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif" font-size="18" text-anchor="middle" font-weight="700">${formatNumber(user.public_repos)}</text>
  </g>
  
  <!-- Country Rank Label -->
  <g transform="translate(320, 110)">
    <rect x="0" y="0" width="160" height="45" rx="8" fill="${t.cardBg}" stroke="${t.border}" stroke-width="1"/>
    <text x="80" y="20" fill="${t.subtext}" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif" font-size="9" text-anchor="middle" font-weight="500" letter-spacing="0.5">COUNTRY RANK</text>
    <text x="80" y="38" fill="${rankColor}" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif" font-size="14" text-anchor="middle" font-weight="700">
      ${rank > 0 ? `Top ${Math.round((rank / total) * 100) || 1}% in ${countryName}` : "Not Ranked"}
    </text>
  </g>
  
  <!-- Footer -->
  <text x="15" y="183" fill="${t.subtext}" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif" font-size="10" opacity="0.7">
    github-rankings.vercel.app
  </text>
  
  <!-- GitHub Icon -->
  <g transform="translate(455, 165)">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" fill="${t.subtext}" opacity="0.5" transform="scale(0.8)"/>
  </g>
</svg>
  `.trim()
}

function generateErrorSVG(message: string, theme: string): string {
  const isDark = theme !== "light"
  return `
<svg width="495" height="120" viewBox="0 0 495 120" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="errorBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${isDark ? "#1a0a0a" : "#fef2f2"}"/>
      <stop offset="100%" style="stop-color:${isDark ? "#2d1515" : "#fee2e2"}"/>
    </linearGradient>
  </defs>
  <rect x="0.5" y="0.5" width="494" height="119" rx="12" fill="url(#errorBg)" stroke="${isDark ? "#7f1d1d" : "#fecaca"}" stroke-width="1"/>
  <circle cx="50" cy="60" r="24" fill="${isDark ? "#450a0a" : "#fecaca"}" stroke="${isDark ? "#dc2626" : "#f87171"}" stroke-width="2"/>
  <text x="50" y="68" fill="${isDark ? "#f87171" : "#dc2626"}" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="24" text-anchor="middle">!</text>
  <text x="90" y="55" fill="${isDark ? "#fca5a5" : "#991b1b"}" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="16" font-weight="600">
    Unable to load badge
  </text>
  <text x="90" y="78" fill="${isDark ? "#f87171" : "#b91c1c"}" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="12">
    ${message}
  </text>
</svg>
  `.trim()
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const { searchParams } = new URL(request.url)
  const theme = (searchParams.get("theme") as "dark" | "light" | "gradient" | "midnight" | "ocean" | "sunset") || "dark"

  const cacheKey = `${username.toLowerCase()}:${theme}`
  const cached = badgeCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < BADGE_CACHE_TTL) {
    return new NextResponse(cached.svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=21600, s-maxage=21600, stale-while-revalidate=43200",
        "X-Cache": "HIT",
      },
    })
  }

  let user: any | null = null
  try {
    user = await getUserDetails(username)
  } catch (err: any) {
    if (err instanceof Error && err.message === "RATE_LIMITED") {
      // Fallback to a lightweight placeholder user so the badge still renders
      user = {
        login: username,
        id: 0,
        avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(username)}`,
        html_url: `https://github.com/${username}`,
        name: username,
        company: null,
        blog: "",
        location: null,
        bio: null,
        twitter_username: null,
        public_repos: 0,
        public_gists: 0,
        followers: 0,
        following: 0,
        created_at: new Date().toISOString(),
      }
    } else {
      const errorSvg = generateErrorSVG(`User "${username}" not found or API rate limited. Try again later.`, theme)
      return new NextResponse(errorSvg, {
        headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=300" },
      })
    }
  }

  const country = detectCountry(user.location)
  let rank = 0
  let total = 0

  if (country) {
    const rankData = await getUserRank(country.name, username)
    rank = rankData.rank
    total = rankData.total
  }

  // Add generated contribution stats so the badge matches the homepage data
  const userWithContrib = generateMockContributions(user as any)

  // Try to fetch the avatar and embed it into the SVG as a data URI so browsers reliably render it
  let avatarDataUrl: string | undefined = undefined
  try {
    const avatarResp = await fetch(user.avatar_url)
    if (avatarResp.ok) {
      const contentType = avatarResp.headers.get("content-type") || "image/png"
      const buf = await avatarResp.arrayBuffer()
      const base64 = Buffer.from(buf).toString("base64")
      avatarDataUrl = `data:${contentType};base64,${base64}`
    }
  } catch (e) {
    // ignore avatar embedding errors and fall back to remote URL in SVG
  }

  const svg = generateSVG(userWithContrib, country, rank, total, theme, avatarDataUrl)

  badgeCache.set(cacheKey, { svg, timestamp: Date.now(), user: userWithContrib })

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=21600, s-maxage=21600, stale-while-revalidate=43200",
      "X-Cache": "MISS",
    },
  })
}
