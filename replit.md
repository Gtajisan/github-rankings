# GitHub User Analytics / GitHub Rankings

## Overview

A lightweight Next.js application that generates country-based GitHub ranking badges and provides a searchable list of top GitHub users by country. The app creates dynamic SVG badges showing user avatars, followers, repositories, and country rankings. It includes caching mechanisms and rate-limit fallbacks to sample data.

**Key Features:**
- Dynamic SVG badge generation per GitHub username with multiple themes
- Country-based user search with contribution data display
- World rankings view for global GitHub user statistics
- Rate limiting handling with fallback to sample data
- Optional GitHub token support for increased API limits

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework:** Next.js 16 with App Router (React Server Components enabled)
- **UI Components:** shadcn/ui component library built on Radix UI primitives
- **Styling:** Tailwind CSS v4 with custom CSS variables for theming
- **State Management:** React hooks with SWR for data fetching and caching
- **Typography:** Geist font family (sans and mono variants)

### Page Structure
- `/` - Main rankings page with country selector and user table
- `/badge` - Badge generator page for creating embeddable SVG badges
- `/api/badge/[username]` - Dynamic SVG badge generation endpoint
- `/api/github/users` - User search API with country filtering

### Component Organization
- `components/` - Feature components (rankings, user cards, search)
- `components/ui/` - Reusable shadcn/ui primitives
- `lib/` - Utility functions, API helpers, and data (countries list)
- `hooks/` - Custom React hooks (mobile detection, toast notifications)

### Backend Architecture
- **API Routes:** Next.js Route Handlers in `app/api/`
- **Caching:** In-memory Map-based caching with configurable TTL (1 hour for API, 6 hours for badges)
- **Rate Limiting:** Tracks GitHub API rate limits from response headers, falls back gracefully

### Data Flow
1. Frontend requests user data via SWR with automatic revalidation
2. API routes fetch from GitHub API with token authentication when available
3. Contribution data is generated/mocked for display consistency
4. Responses are cached in-memory to reduce API calls

## External Dependencies

### GitHub API
- **Purpose:** Fetch user profiles, search users by location, retrieve contribution data
- **Authentication:** Optional `GITHUB_TOKEN` environment variable for increased rate limits
- **Endpoints Used:**
  - `/users/{username}` - User profile details
  - `/search/users` - Location-based user search with sorting
- **Rate Limits:** 60 requests/hour unauthenticated, 5000/hour with token

### Vercel Analytics
- **Purpose:** Production analytics tracking
- **Integration:** `@vercel/analytics` package, included in root layout

### Environment Variables
- `GITHUB_TOKEN` or `NEXT_PUBLIC_GITHUB_TOKEN` - Optional GitHub personal access token for API authentication

### Key npm Dependencies
- `next` - React framework
- `swr` - Data fetching with caching
- `@radix-ui/*` - Accessible UI primitives
- `lucide-react` - Icon library
- `class-variance-authority` - Component variant management
- `tailwind-merge` - Tailwind class merging utility