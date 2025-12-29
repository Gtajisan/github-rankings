"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
import { type Country, type SortField, countries } from "@/lib/countries"
import { type GitHubUser, generateMockContributions } from "@/lib/github-api"
import { CountrySelector } from "./country-selector"
import { SortTabs } from "./sort-tabs"
import { UsersTable } from "./users-table"
import { StatsHeader } from "./stats-header"
import { UserSearch } from "./user-search"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Github, RefreshCw, ChevronDown, BadgeCheck, AlertCircle } from "lucide-react"

interface SearchResponse {
  users: GitHubUser[]
  total_count: number
  isLiveData?: boolean
  message?: string
  rateLimitInfo?: {
    remaining: number
    resetAt: string | null
    isLimited: boolean
  }
}

const fetcher = async (url: string): Promise<SearchResponse> => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

export function GitHubRankings() {
  // Add a 'World' pseudo-country for all users
  const worldCountry = useMemo(() => ({ code: "WORLD", name: "World", flag: "🌍", cities: [] }), [])
  const [selectedCountry, setSelectedCountry] = useState<Country>(worldCountry)
  const [sortField, setSortField] = useState<SortField>("followers")
  const [page, setPage] = useState(1)
  const [showCountrySelector, setShowCountrySelector] = useState(false)

  const pageSize = 10 // Reduced from 30 for stability
  const { data, error, isLoading, mutate } = useSWR<SearchResponse>(
    selectedCountry
      ? selectedCountry.code === "WORLD"
        ? `/api/github/users?page=${page}`
        : `/api/github/users?country=${encodeURIComponent(selectedCountry.name)}&page=${page}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
      shouldRetryOnError: false,
    },
  )

  // Add mock contribution data and sort
  const sortedUsers = useMemo(() => {
    if (!data?.users) return []

    const usersWithContributions = data.users.map((user) =>
      user.public_contributions ? user : generateMockContributions(user),
    )

    return [...usersWithContributions].sort((a, b) => {
      switch (sortField) {
        case "followers":
          return b.followers - a.followers
        case "public_contributions":
          return (b.public_contributions || 0) - (a.public_contributions || 0)
        case "total_contributions":
          return (b.total_contributions || 0) - (a.total_contributions || 0)
        case "public_repos":
          return b.public_repos - a.public_repos
        default:
          return b.followers - a.followers
      }
    })
  }, [data?.users, sortField])

  const stats = useMemo(() => {
    if (!sortedUsers.length) return { totalFollowers: 0, totalRepos: 0 }
    return {
      totalFollowers: sortedUsers.reduce((sum, u) => sum + u.followers, 0),
      totalRepos: sortedUsers.reduce((sum, u) => sum + u.public_repos, 0),
    }
  }, [sortedUsers])

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country)
    setPage(1)
    setShowCountrySelector(false)
  }

  const handleCountrySelectByName = (countryName: string) => {
    if (countryName === "World") {
      handleCountrySelect(worldCountry)
      return
    }
    const country = countries.find((c) => c.name === countryName)
    if (country) {
      handleCountrySelect(country)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/5 bg-card/30 backdrop-blur-xl sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Github className="w-8 h-8 text-primary animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-bold anime-gradient-text tracking-tight">GitHub Analytics</h1>
                <p className="text-xs font-medium text-primary/60 uppercase tracking-widest">Gtajisan Edition</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/badge">
                <Button variant="outline" size="sm" className="glass-card hover:bg-primary/10 border-primary/20">
                  <BadgeCheck className="w-4 h-4 mr-2 text-primary" />
                  <span className="hidden sm:inline">Get Badge</span>
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => mutate()} disabled={isLoading} className="glass-card hover:bg-primary/10">
                <RefreshCw className={`w-4 h-4 mr-2 text-primary ${isLoading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <a
                href="https://github.com/Gtajisan/github-rankings"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card flex items-center gap-2 rounded-xl px-4 py-2 text-sm hover:bg-primary/10 hover:border-primary/30 transition-all"
                aria-label="Repository"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="text-primary">
                  <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.9.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.36-1.3-1.72-1.3-1.72-1.06-.73.08-.72.08-.72 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.72 1.27 3.39.97.11-.76.41-1.27.75-1.56-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.19.92-.26 1.9-.39 2.88-.39s1.96.13 2.88.39c2.21-1.5 3.18-1.19 3.18-1.19.63 1.59.23 2.77.11 3.06.74.81 1.19 1.84 1.19 3.1 0 4.41-2.69 5.4-5.25 5.68.42.36.8 1.08.8 2.18 0 1.57-.02 2.83-.02 3.22 0 .31.21.68.8.56C20.71 21.39 24 17.08 24 12c0-6.27-5.23-11.5-12-11.5z" />
                </svg>
                <span className="hidden sm:inline font-bold">Repo</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {data && data.isLiveData === false && (
          <div className="mb-6 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-500 font-medium">GitHub API Rate Limit Reached</p>
              <p className="text-muted-foreground text-sm mt-1">
                {data.message || "Showing sample data. Live data will be available when rate limit resets."}
              </p>
              {data.rateLimitInfo?.resetAt && (
                <p className="text-muted-foreground text-xs mt-1">
                  Rate limit resets at: {new Date(data.rateLimitInfo.resetAt).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Mobile Country Selector Toggle */}
          <div className="lg:hidden">
            <Button
              variant="outline"
              className="w-full justify-between bg-transparent"
              onClick={() => setShowCountrySelector(!showCountrySelector)}
            >
              <span className="flex items-center gap-2">
                <span className="text-4xl">{selectedCountry.flag}</span>
                {selectedCountry.name}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showCountrySelector ? "rotate-180" : ""}`} />
            </Button>

            {showCountrySelector && (
              <div className="mt-4 p-4 glass-card rounded-2xl">
                <CountrySelector selectedCountry={selectedCountry} onSelect={handleCountrySelect} />
              </div>
            )}
          </div>

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24 space-y-4">
              <UserSearch onCountrySelect={handleCountrySelectByName} />

              <div className="glass-card rounded-2xl p-4">
                <CountrySelector selectedCountry={selectedCountry} onSelect={handleCountrySelect} />
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="lg:hidden mb-6">
              <UserSearch onCountrySelect={handleCountrySelectByName} />
            </div>

            {selectedCountry && (
              <>
                {/* Country Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl">{selectedCountry.flag}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Top Developers in {selectedCountry.name}</h2>
                      <p className="text-muted-foreground">
                        Ranked by {sortField.replace(/_/g, " ")} • {data?.total_count?.toLocaleString() || 0} developers
                        found
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <StatsHeader
                  country={selectedCountry}
                  totalUsers={data?.total_count || 0}
                  totalFollowers={stats.totalFollowers}
                  totalRepos={stats.totalRepos}
                />

                {/* Sort Tabs */}
                <div className="mb-6">
                  <SortTabs activeSort={sortField} onSortChange={setSortField} />
                </div>

                {/* Error State */}
                {error && (
                  <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 mb-6">
                    <p className="text-destructive">
                      Failed to load users. GitHub API rate limit may have been exceeded.
                    </p>
                    <Button variant="outline" size="sm" onClick={() => mutate()} className="mt-2">
                      Try Again
                    </Button>
                  </div>
                )}

                {/* Users Table */}
                <UsersTable users={sortedUsers} sortField={sortField} loading={isLoading} page={page} pageSize={pageSize} />

                {/* Load More */}
                {sortedUsers.length > 0 && sortedUsers.length < (data?.total_count || 0) && (
                  <div className="mt-6 text-center">
                    <Button variant="outline" onClick={() => setPage((p) => p + 1)} disabled={isLoading}>
                      Load More
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-12 py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full -bottom-24 scale-150" />
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <div className="flex flex-col items-center gap-4">
            <h3 className="text-lg font-bold anime-gradient-text tracking-widest uppercase">Gtajisan World</h3>
            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
              Modern analytics dashboard reimagined with glassmorphism and anime aesthetics.
            </p>
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm">
            <a
              href="mailto:ffjisan804@gmail.com"
              className="glass-card px-4 py-2 rounded-xl text-primary hover:text-white transition-colors"
            >
              ffjisan804@gmail.com
            </a>
            <span className="hidden sm:block text-white/10">|</span>
            <a
              href="https://github.com/Gtajisan"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card px-4 py-2 rounded-xl text-primary hover:text-white transition-colors"
            >
              Developer: Gtajisan
            </a>
            <span className="hidden sm:block text-white/10">|</span>
            <a
              href="https://github.com/Gtajisan/github-rankings"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card px-4 py-2 rounded-xl text-primary hover:text-white transition-colors"
            >
              Source Code
            </a>
          </div>
          
          <div className="mt-12 text-xs text-muted-foreground/40 font-mono tracking-tighter">
            PRO CODER MODIFICATION • EST. 2025
          </div>
        </div>
      </footer>
    </div>
  )
}
