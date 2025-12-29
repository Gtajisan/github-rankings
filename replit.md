# GitHub User Analytics / GitHub Rankings

## Overview

A lightweight Next.js application that generates country-based GitHub ranking badges and provides a searchable list of top GitHub users by country. The app creates dynamic SVG badges showing user avatars, followers, repositories, and country rankings. It includes caching mechanisms and rate-limit fallbacks to sample data.

**Key Features:**
- Dynamic SVG badge generation per GitHub username with multiple themes
- Country-based user search with contribution data display
- World rankings view for global GitHub user statistics
- Rate limiting handling with fallback to sample data
- Robust error handling for GitHub API 504 and rate limits
- Modern anime-inspired UI with glassmorphism effects (blur and transparency)
- Attribution and branding for Gtajisan (ffjisan804@gmail.com)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework:** Next.js 16 with App Router
- **UI Components:** shadcn/ui component library built on Radix UI primitives
- **Styling:** Tailwind CSS v4 with custom CSS variables for anime-inspired glassmorphism
- **State Management:** React hooks with SWR for data fetching and caching
- **Typography:** Geist font family

### Page Structure
- `/` - Main rankings page with country selector, user table, and glassmorphism UI
- `/badge` - Badge generator page for creating embeddable SVG badges
- `/api/badge/[username]` - Dynamic SVG badge generation endpoint
- `/api/github/users` - User search API with country filtering and sample data fallback

### Component Organization
- `components/` - Feature components (rankings, user cards, search)
- `components/ui/` - Reusable shadcn/ui primitives
- `lib/` - Utility functions, API helpers, countries list, and sample data

### Backend Architecture
- **API Routes:** Next.js Route Handlers
- **Caching:** In-memory Map-based caching (1 hour for API, 6 hours for badges)
- **Rate Limiting:** Graceful fallback to `lib/sample-data.ts` when limits are hit or errors occur

## External Dependencies

### GitHub API
- **Purpose:** Fetch user profiles and search users by location
- **Authentication:** `GITHUB_TOKEN` environment variable
- **Rate Limits:** 60/hr unauthenticated, 5000/hr with token

### Vercel Analytics
- **Purpose:** Production analytics tracking

## Recent Changes (December 2025)
- Rebuilt UI with modern glassmorphism and anime-style aesthetics
- Updated all branding and credits to Gtajisan (ffjisan804@gmail.com)
- Implemented robust fallback system to `lib/sample-data.ts` for API failures
- Fixed "No users found" issues with automatic global fallback
- Reduced page size to 10 users for improved API stability
