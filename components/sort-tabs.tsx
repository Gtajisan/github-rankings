"use client"

import type React from "react"

import type { SortField } from "@/lib/countries"
import { Users, GitCommit, Activity, FolderGit2 } from "lucide-react"

interface SortTabsProps {
  activeSort: SortField
  onSortChange: (sort: SortField) => void
}

const sortOptions: { field: SortField; label: string; icon: React.ReactNode }[] = [
  { field: "followers", label: "Followers", icon: <Users className="w-4 h-4" /> },
  { field: "public_contributions", label: "Public Contributions", icon: <GitCommit className="w-4 h-4" /> },
  { field: "total_contributions", label: "Total Contributions", icon: <Activity className="w-4 h-4" /> },
  { field: "public_repos", label: "Public Repos", icon: <FolderGit2 className="w-4 h-4" /> },
]

export function SortTabs({ activeSort, onSortChange }: SortTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {sortOptions.map((option) => (
        <button
          key={option.field}
          onClick={() => onSortChange(option.field)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeSort === option.field
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-accent"
          }`}
        >
          {option.icon}
          <span className="hidden sm:inline">{option.label}</span>
        </button>
      ))}
    </div>
  )
}
