# GitHub User Analytics / GitHub Rankings

Developed by **Gtajisan** ([ffjisan804@gmail.com](mailto:ffjisan804@gmail.com))

Lightweight Next.js app that generates country-based GitHub ranking badges and a searchable list of top users by country.

## Features

- Dynamic SVG badge per GitHub username with avatar, followers, repos and country rank
- Country-based user search API with contribution mock data for display
- Caching and rate-limit fallback to sample data
- Optionally use a GitHub token to increase API rate limits

## Quick start

Requirements

- Node.js 18+ (tested with Node 18/20)
- pnpm (recommended) or npm

Install

```bash
pnpm install
```

Set up environment

Create a `.env.local` file in the project root to provide an optional GitHub token (recommended to avoid rate limiting):

```
GITHUB_TOKEN=ghp_your_personal_access_token_here
# or NEXT_PUBLIC_GITHUB_TOKEN=...
```

Run development server

```bash
pnpm dev
```

Open http://localhost:3000 and visit the Badge page to generate and preview badges.

## Important API endpoints

- Badge image (SVG): `/api/badge/[username]?theme=<theme>`
  - Example: `/api/badge/anbuinfosec?theme=dark`
  - Themes: `dark`, `light`, `gradient`, `midnight`, `ocean`, `sunset`
  - The badge embeds the avatar (data URI) when possible to avoid mixed-content rendering issues.

- GitHub users by country: `/api/github/users?country=<country>&page=<n>`
  - Returns user details with generated `public_contributions` and `total_contributions` fields.

## Handling rate limits

- The project supports using a GitHub Personal Access Token via the `GITHUB_TOKEN` or `NEXT_PUBLIC_GITHUB_TOKEN` environment variable. When present, requests to the GitHub API include an `Authorization: token <token>` header.
- If the server detects GitHub rate limiting, the app falls back to sample data from `lib/sample-data.ts` so pages and badges still render.

## Badge behavior and caching

- Badge SVG responses are cached in-memory for 6 hours. Cache keys include username and theme.
- Country detection uses heuristics (country names, cities, US state names, common aliases) to map `location` strings to a country. If no country is detected the badge will show "Unknown" and rank may be N/A.

## Development notes

- Key files:
  - `app/api/badge/[username]/route.ts` — badge generation logic and SVG template
  - `lib/github-api.ts` — GitHub API helpers and rate-limit handling
  - `lib/sample-data.ts` — sample users used when rate limited

- To preview a badge locally and save it:

```bash
curl -sS "http://localhost:3000/api/badge/USERNAME?theme=dark" --output badge.svg
open badge.svg
```

## Contributing

- PRs welcome. Keep changes small and document behavior changes.

## License

MIT
