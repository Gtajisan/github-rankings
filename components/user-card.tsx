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
    <div className="group flex items-center gap-4 p-4 rounded-2xl glass-card hover:scale-[1.01] hover:border-primary/50 transition-all duration-300">
      <div
        className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl border-2 font-black text-sm shadow-inner ${getRankBadgeColor(rank)}`}
      >
        #{rank}
      </div>

      <Avatar className="w-12 h-12 border-2 border-white/10 ring-2 ring-primary/20">
        <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.login} className="object-cover" />
        <AvatarFallback className="bg-primary/10 text-primary font-bold">{user.login.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={user.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
          >
            {user.name || user.login}
            <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5 -translate-x-1" />
          </a>
          <span className="text-primary/40 text-xs font-mono uppercase tracking-tighter">@{user.login}</span>
        </div>

        <div className="flex items-center gap-4 mt-1.5 text-xs font-medium text-muted-foreground/80 flex-wrap">
          {user.company && (
            <span className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded-md">
              <Building className="w-3 h-3 text-primary/60" />
              {user.company}
            </span>
          )}
          {user.location && (
            <span className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded-md">
              <MapPin className="w-3 h-3 text-primary/60" />
              {user.location}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6 flex-shrink-0">
        <div className="text-center hidden sm:block">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-bold">Repos</div>
          <div className="font-bold text-foreground flex items-center justify-center gap-1">
            <GitFork className="w-3 h-3 text-primary/60" />
            {user.public_repos.toLocaleString()}
          </div>
        </div>

        <div className="text-center hidden md:block">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-bold">Followers</div>
          <div className="font-bold text-foreground flex items-center justify-center gap-1">
            <Users className="w-3 h-3 text-primary/60" />
            {user.followers.toLocaleString()}
          </div>
        </div>

        <div className="text-center min-w-[110px] bg-primary/5 p-2 rounded-xl border border-primary/10">
          <div className="text-[10px] uppercase tracking-widest text-primary/60 font-black">{mainStat.label}</div>
          <div className="font-black text-primary text-xl flex items-center justify-center gap-1 drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]">
            <Star className="w-4 h-4 fill-primary" />
            {mainStat.value.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  )
}
