export interface GitHubUser {
  login: string
  id: number
  avatar_url: string
  html_url: string
  name: string | null
  company: string | null
  blog: string | null
  location: string | null
  bio: string | null
  twitter_username: string | null
  public_repos: number
  public_gists: number
  followers: number
  following: number
  created_at: string
  public_contributions?: number
  total_contributions?: number
}

export interface SearchUsersResponse {
  total_count: number
  incomplete_results: boolean
  items: GitHubUser[]
}

const GITHUB_API_BASE = "https://api.github.com"

const cache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data as T
  }
  cache.delete(key)
  return null
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, timestamp: Date.now() })
}

let rateLimitRemaining = 60
let rateLimitReset = 0

function updateRateLimitFromHeaders(headers: Headers) {
  const remaining = headers.get("x-ratelimit-remaining")
  const reset = headers.get("x-ratelimit-reset")
  if (remaining) rateLimitRemaining = Number.parseInt(remaining)
  if (reset) rateLimitReset = Number.parseInt(reset) * 1000
}

function getAuthHeaders(): Record<string, string> {
  const token = process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN
  if (!token) return {}
  // Prefer the `token` scheme for GitHub v3 API compatibility
  return { Authorization: `token ${token}` }
}

export function isRateLimited(): boolean {
  return rateLimitRemaining <= 1 && Date.now() < rateLimitReset
}

export function getRateLimitInfo() {
  return {
    remaining: rateLimitRemaining,
    resetAt: rateLimitReset ? new Date(rateLimitReset).toISOString() : null,
    isLimited: isRateLimited(),
  }
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 3): Promise<Response> {
  const timeout = 10000; // 10s timeout
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);

    if (response.status === 504 || response.status === 502 || response.status === 503) {
      if (retries > 0) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, 4 - retries) * 1000));
        return fetchWithRetry(url, options, retries - 1);
      }
    }
    return response;
  } catch (error) {
    clearTimeout(id);
    if (retries > 0 && (error instanceof Error && (error.name === 'AbortError' || error.message.includes('fetch')))) {
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, 4 - retries) * 1000));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

export async function searchUsersByLocation(location: string, page = 1, perPage = 30): Promise<SearchUsersResponse> {
  const cacheKey = `search:${location}:${page}:${perPage}`
  const cached = getCached<SearchUsersResponse>(cacheKey)
  if (cached) return cached

  if (isRateLimited()) {
    throw new Error("RATE_LIMITED")
  }

  const query = encodeURIComponent(`location:${location} type:user`)
  const url = `${GITHUB_API_BASE}/search/users?q=${query}&sort=followers&order=desc&page=${page}&per_page=${perPage}`

  const response = await fetchWithRetry(url, {
    headers: {
      Accept: "application/vnd.github.v3+json",
      ...getAuthHeaders(),
    },
  })

  updateRateLimitFromHeaders(response.headers)

  if (response.status === 403) {
    throw new Error("RATE_LIMITED")
  }

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`)
  }

  const data = await response.json()
  setCache(cacheKey, data)
  return data
}

export async function getUserDetails(username: string): Promise<GitHubUser> {
  const cacheKey = `user:${username}`
  const cached = getCached<GitHubUser>(cacheKey)
  if (cached) return cached

  if (isRateLimited()) {
    throw new Error("RATE_LIMITED")
  }

  const url = `${GITHUB_API_BASE}/users/${username}`

  const response = await fetchWithRetry(url, {
    headers: {
      Accept: "application/vnd.github.v3+json",
      ...getAuthHeaders(),
    },
  })

  updateRateLimitFromHeaders(response.headers)

  if (response.status === 403) {
    throw new Error("RATE_LIMITED")
  }

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`)
  }

  const data = await response.json()
  setCache(cacheKey, data)
  return data
}

export async function getMultipleUserDetails(usernames: string[]): Promise<GitHubUser[]> {
  const results: GitHubUser[] = []

  for (const username of usernames) {
    try {
      const user = await getUserDetails(username)
      results.push(user)
    } catch (error) {
      if (error instanceof Error && error.message === "RATE_LIMITED") {
        break // Stop fetching if rate limited
      }
    }
  }

  return results
}

export function generateMockContributions(user: GitHubUser): GitHubUser {
  const baseContributions = Math.floor(user.public_repos * 50 + user.followers * 2)
  return {
    ...user,
    public_contributions: baseContributions + Math.floor(Math.random() * 500),
    total_contributions: baseContributions + Math.floor(Math.random() * 2000) + 500,
  }
}
