import { type NextRequest, NextResponse } from "next/server"
import {
  searchUsersByLocation,
  getMultipleUserDetails,
  generateMockContributions,
  getRateLimitInfo,
} from "@/lib/github-api"
import { sampleUsers } from "@/lib/sample-data"


export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  let country = searchParams.get("country") ?? ""
  const page = Number.parseInt(searchParams.get("page") || "1")

  // If no country or country is 'all' or 'world', treat as global search
  const isWorld = !country || country.toLowerCase() === "all" || country.toLowerCase() === "world"
  if (isWorld) country = "" // empty string disables location filter

  try {
    // Search for users by location
    const searchResults = await searchUsersByLocation(country, page, 10)

    // Get detailed info for each user
    const usernames = searchResults.items.map((user) => user.login)
    const detailedUsers = await getMultipleUserDetails(usernames)

    // Add mock contributions
    const usersWithContributions = detailedUsers.map(generateMockContributions)

    return NextResponse.json({
      users: usersWithContributions,
      total_count: searchResults.total_count,
      page,
      rateLimitInfo: getRateLimitInfo(),
      isLiveData: true,
    })
  } catch (error) {
    console.error("GitHub API error:", error)

    // Fallback to sample data for ANY error to keep the app working
    return NextResponse.json({
      users: sampleUsers,
      total_count: sampleUsers.length,
      page: 1,
      rateLimitInfo: getRateLimitInfo(),
      isLiveData: false,
      message: error instanceof Error && error.message === "RATE_LIMITED" 
        ? "GitHub API rate limit reached. Showing sample data." 
        : "Failed to fetch from GitHub. Showing sample data.",
    })
  }
}
