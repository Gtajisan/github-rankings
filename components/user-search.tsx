"use client"

import type React from "react"

import { useState } from "react"
import { Search, MapPin, Users, GitFork, Trophy, Loader2, X, ExternalLink } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { type GitHubUser, generateMockContributions } from "@/lib/github-api"
import { countries } from "@/lib/countries"

interface UserSearchProps {
  onCountrySelect?: (countryName: string) => void
}

interface UserRankData {
  user: GitHubUser
  countryRank: number | null
  totalInCountry: number
  country: string | null
}

export function UserSearch({ onCountrySelect }: UserSearchProps) {
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userData, setUserData] = useState<UserRankData | null>(null)

  const searchUser = async () => {
    if (!username.trim()) return

    setLoading(true)
    setError(null)
    setUserData(null)

    try {
      // Fetch user details
      const userRes = await fetch(`https://api.github.com/users/${username.trim()}`)
      if (!userRes.ok) {
        if (userRes.status === 404) {
          throw new Error("User not found")
        }
        throw new Error("Failed to fetch user")
      }

      const user: GitHubUser = await userRes.json()
      const userWithContributions = generateMockContributions(user)

      let countryRank: number | null = null
      let totalInCountry = 0
      let detectedCountry: string | null = null

      // Try to find country from location
      if (user.location) {
        const locationLower = user.location.toLowerCase()
        const matchedCountry = countries.find(
          (c) =>
            locationLower.includes(c.name.toLowerCase()) ||
            c.cities?.some((city) => locationLower.includes(city.toLowerCase())),
        )

        if (matchedCountry) {
          detectedCountry = matchedCountry.name

          // Fetch users from that country to determine rank
          const countryRes = await fetch(`/api/github/users?country=${encodeURIComponent(matchedCountry.name)}&page=1`)
          if (countryRes.ok) {
            const countryData = await countryRes.json()
            totalInCountry = countryData.total_count

            // Find user's rank by followers
            const usersWithContributions = countryData.users.map(generateMockContributions)
            const sortedByFollowers = [...usersWithContributions].sort((a, b) => b.followers - a.followers)
            const userIndex = sortedByFollowers.findIndex((u) => u.login.toLowerCase() === username.toLowerCase())

            if (userIndex !== -1) {
              countryRank = userIndex + 1
            } else {
              // User not in top results, estimate rank based on followers
              const lowestFollowers = sortedByFollowers[sortedByFollowers.length - 1]?.followers || 0
              if (user.followers < lowestFollowers) {
                countryRank = sortedByFollowers.length + Math.floor((lowestFollowers - user.followers) / 10) + 1
              }
            }
          }
        }
      }

      setUserData({
        user: userWithContributions,
        countryRank,
        totalInCountry,
        country: detectedCountry,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search user")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchUser()
    }
  }

  const clearSearch = () => {
    setUsername("")
    setUserData(null)
    setError(null)
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <Search className="w-4 h-4" />
        Check User Rank
      </h3>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Enter GitHub username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pr-8 bg-background"
          />
          {username && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <Button onClick={searchUser} disabled={loading || !username.trim()} size="sm">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </Button>
      </div>

      {error && (
        <div className="mt-3 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {userData && (
        <div className="mt-4 space-y-4">
          {/* User Card */}
          <div className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border">
            <img
              src={userData.user.avatar_url || "/placeholder.svg"}
              alt={userData.user.login}
              className="w-12 h-12 rounded-full border-2 border-primary/20"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <a
                  href={userData.user.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-foreground hover:text-primary truncate flex items-center gap-1"
                >
                  {userData.user.name || userData.user.login}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-sm text-muted-foreground">@{userData.user.login}</p>
              {userData.user.location && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {userData.user.location}
                </p>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-background rounded-lg border border-border text-center">
              <Users className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-lg font-bold text-foreground">{userData.user.followers.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
            <div className="p-3 bg-background rounded-lg border border-border text-center">
              <GitFork className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-lg font-bold text-foreground">{userData.user.public_repos.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Repositories</p>
            </div>
          </div>

          {/* Rank Display */}
          {userData.country && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Country Rank</span>
                <Trophy
                  className={`w-5 h-5 ${
                    userData.countryRank === 1
                      ? "text-yellow-500"
                      : userData.countryRank === 2
                        ? "text-gray-400"
                        : userData.countryRank === 3
                          ? "text-amber-600"
                          : "text-muted-foreground"
                  }`}
                />
              </div>
              <div className="flex items-baseline gap-2">
                {userData.countryRank ? (
                  <>
                    <span className="text-3xl font-bold text-primary">#{userData.countryRank}</span>
                    <span className="text-sm text-muted-foreground">
                      of {userData.totalInCountry.toLocaleString()} developers
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">Rank unavailable</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">in {userData.country}</p>

              {onCountrySelect && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3 bg-transparent"
                  onClick={() => onCountrySelect(userData.country!)}
                >
                  View {userData.country} Rankings
                </Button>
              )}
            </div>
          )}

          {!userData.country && userData.user.location && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Could not determine country from location "{userData.user.location}". Ranking not available.
              </p>
            </div>
          )}

          {!userData.user.location && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                This user has not set a location. Country ranking is not available.
              </p>
            </div>
          )}

          {/* Contribution Stats */}
          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Estimated Contributions</p>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Public</span>
              <span className="font-medium text-foreground">
                {userData.user.public_contributions?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium text-foreground">{userData.user.total_contributions?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
