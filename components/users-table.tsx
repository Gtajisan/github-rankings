"use client"

import type { GitHubUser } from "@/lib/github-api"
import type { SortField } from "@/lib/countries"
import { UserCard } from "./user-card"
import { Skeleton } from "@/components/ui/skeleton"

interface UsersTableProps {
  users: GitHubUser[]
  sortField: SortField
  loading?: boolean
  page?: number
  pageSize?: number
}

export function UsersTable({ users, sortField, loading, page = 1, pageSize = 30 }: UsersTableProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg">No users found</p>
        <p className="text-sm mt-1">Try selecting a different country</p>
      </div>
    )
  }

  const startRank = (page - 1) * pageSize + 1
  return (
    <div className="space-y-3">
      {users.map((user, index) => (
        <UserCard key={user.id} user={user} rank={startRank + index} sortField={sortField} />
      ))}
    </div>
  )
}
