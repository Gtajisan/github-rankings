import { type NextRequest, NextResponse } from "next/server"
import {
  searchUsersByLocation,
  getMultipleUserDetails,
  generateMockContributions,
  getRateLimitInfo,
} from "@/lib/github-api"


export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  let country = searchParams.get("country") ?? ""
  const page = Number.parseInt(searchParams.get("page") || "1")

  // If no country or country is 'all' or 'world', treat as global search
  const isWorld = !country || country.toLowerCase() === "all" || country.toLowerCase() === "world"
  if (isWorld) country = "" // empty string disables location filter

  try {
    // Search for users by location
    const searchResults = await searchUsersByLocation(country, page, 30)

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

    // If rate limited, just return an error now (no sample data fallback)
    if (error instanceof Error && error.message === "RATE_LIMITED") {
      return NextResponse.json({
        error: "GitHub API rate limit reached. Please try again later.",
        rateLimitInfo: getRateLimitInfo(),
        isLiveData: false,
      }, { status: 429 })
    }

    if (error instanceof Error && error.message.includes("504")) {
      return NextResponse.json({
        error: "GitHub API is currently busy (Gateway Timeout). Retrying might help.",
        rateLimitInfo: getRateLimitInfo(),
        isLiveData: false,
      }, { status: 504 })
    }

    console.error("GitHub API error:", error)
    return NextResponse.json({ error: "Failed to fetch users from GitHub" }, { status: 500 })
  }
}
