"use client"

import { useState, useMemo } from "react"
import { countries, type Country } from "@/lib/countries"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Globe, ChevronRight } from "lucide-react"

interface CountrySelectorProps {
  selectedCountry: Country | null
  onSelect: (country: Country) => void
}

export function CountrySelector({ selectedCountry, onSelect }: CountrySelectorProps) {
  const [search, setSearch] = useState("")

  // Always sort countries by name
  const sortedCountries = useMemo(() => {
    return [...countries].sort((a, b) => a.name.localeCompare(b.name))
  }, [])
  const filteredCountries = useMemo(() => {
    if (!search) return sortedCountries
    const searchLower = search.toLowerCase()
    return sortedCountries.filter(
      (country) => country.name.toLowerCase().includes(searchLower) || country.code.toLowerCase().includes(searchLower),
    )
  }, [search, sortedCountries])

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Select Country</h2>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search countries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-secondary border-border"
        />
      </div>

      <ScrollArea className="h-[400px] lg:h-[600px]">
        <div className="space-y-1 pr-4">
          {filteredCountries.map((country) => (
            <button
              key={country.code}
              onClick={() => onSelect(country)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors text-left ${
                selectedCountry?.code === country.code
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "hover:bg-accent text-foreground"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{country.flag}</span>
                <div>
                  <p className="font-medium">{country.name}</p>
                  <p className="text-xs text-muted-foreground">{country.cities.slice(0, 3).join(", ")}</p>
                </div>
              </div>
              <ChevronRight
                className={`w-4 h-4 transition-transform ${
                  selectedCountry?.code === country.code ? "text-primary" : "text-muted-foreground"
                }`}
              />
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
