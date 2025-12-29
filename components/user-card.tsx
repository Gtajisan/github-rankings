"use client"

import type { GitHubUser } from "@/lib/github-api"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ExternalLink, Building, MapPin, Users, GitFork, Star } from "lucide-react"

interface UserCardProps {
  user: GitHubUser
  rank: number
  sortField: string
}

export function UserCard({ user, rank, sortField }: UserCardProps) {
  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    if (rank === 2) return "bg-gray-400/20 text-gray-300 border-gray-400/30"
    if (rank === 3) return "bg-orange-500/20 text-orange-400 border-orange-500/30"
    return "bg-secondary text-muted-foreground border-border"
  }

  const getMainStat = () => {
    switch (sortField) {
      case "followers":
        return { label: "Followers", value: user.followers }
      case "public_contributions":
        return { label: "Public Contributions", value: user.public_contributions || 0 }
      case "total_contributions":
        return { label: "Total Contributions", value: user.total_contributions || 0 }
      case "public_repos":
        return { label: "Public Repos", value: user.public_repos }
      default:
        return { label: "Followers", value: user.followers }
    }
  }

  const mainStat = getMainStat()

  return (
    <div className="group flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:bg-accent/50 transition-all">
      <div
        className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg border font-bold text-sm ${getRankBadgeColor(rank)}`}
      >
        #{rank}
      </div>

      <Avatar className="w-12 h-12 border-2 border-border">
        <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.login} />
        <AvatarFallback>{user.login.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={user.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-1"
          >
            {user.name || user.login}
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
          <span className="text-muted-foreground text-sm">@{user.login}</span>
        </div>

        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
          {user.company && (
            <span className="flex items-center gap-1">
              <Building className="w-3 h-3" />
              {user.company}
            </span>
          )}
          {user.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {user.location}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6 flex-shrink-0">
        <div className="text-center hidden sm:block">
          <div className="text-xs text-muted-foreground">Repos</div>
          <div className="font-semibold text-foreground flex items-center justify-center gap-1">
            <GitFork className="w-3 h-3" />
            {user.public_repos.toLocaleString()}
          </div>
        </div>

        <div className="text-center hidden md:block">
          <div className="text-xs text-muted-foreground">Followers</div>
          <div className="font-semibold text-foreground flex items-center justify-center gap-1">
            <Users className="w-3 h-3" />
            {user.followers.toLocaleString()}
          </div>
        </div>

        <div className="text-center min-w-[100px]">
          <div className="text-xs text-muted-foreground">{mainStat.label}</div>
          <div className="font-bold text-primary text-lg flex items-center justify-center gap-1">
            <Star className="w-4 h-4" />
            {mainStat.value.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  )
}
