# 🌟 GitHub User Analytics / GitHub Rankings 🌟

<p align="center">
  <img src="public/placeholder-logo.svg" width="120" height="120" alt="Gtajisan Logo" style="border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" />
</p>

<p align="center">
  <h1 align="center">✨ Gtajisan Edition ✨</h1>
  <p align="center">
    <strong>Modern GitHub Analytics Dashboard</strong><br />
    <i>Reimagined with Glassmorphism & Anime Aesthetics</i>
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/Tailwind-v4-38B2AC?style=for-the-badge&logo=tailwind-css" />
  <img src="https://img.shields.io/badge/TypeScript-Ready-3178C6?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/Status-Stable-brightgreen?style=for-the-badge" />
</p>

---

## 🎭 About the Project

Developed by **Gtajisan** ([ffjisan804@gmail.com](mailto:ffjisan804@gmail.com)), this is a high-performance Next.js application that provides deep insights into the GitHub community. It features a stunning **Glassmorphism UI** inspired by modern anime aesthetics, offering transparency, blur effects, and vibrant gradient animations.

## 🚀 Key Features

- 💎 **Anime Glassmorphism UI**: A beautiful, translucent interface with backdrop blurs and purple/pink neon accents.
- 🏅 **Dynamic Ranking Badges**: Generate stunning SVG badges for any GitHub user. Show off your rank, followers, and repo count.
- 🌍 **Global & Country Rankings**: Real-time leaderboards for top developers worldwide or by specific country.
- 📊 **Intelligent Data Fallback**: Built-in sample data system ensures the app stays functional even if GitHub's API is rate-limited or down.
- ⚡ **Lightning Fast**: Powered by Next.js 16 and SWR for intelligent caching and instant navigation.

## 📱 Screenshots

> *Note: These are conceptual representations of our anime-style UI.*

| **Main Dashboard** | **Ranking Badge** |
|:---:|:---:|
| <img src="public/placeholder.jpg" width="400" alt="Dashboard" /> | <img src="public/placeholder.svg" width="300" alt="Badge" /> |
| *Modern Analytics* | *Embeddable Ranking* |

## 🛠️ Technical Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 + Framer Motion
- **Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React
- **Data Fetching**: SWR (Stale-While-Revalidate)

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+
- npm or pnpm

### Quick Start
```bash
# Clone the repository
git clone https://github.com/Gtajisan/github-rankings.git

# Install dependencies
npm install

# Run development server
npm run dev
```

### Environment Configuration
Create a `.env.local` to use a GitHub token (increases API limit from 60 to 5000 requests/hr):
```env
GITHUB_TOKEN=your_token_here
```

## 📡 API Endpoints

- **Badge Generator**: `GET /api/badge/[username]?theme=gradient`
- **Users API**: `GET /api/github/users?country=Bangladesh&page=1`

## 👤 Credits

Modified and Enhanced by **Gtajisan**
- 📧 Email: [ffjisan804@gmail.com](mailto:ffjisan804@gmail.com)
- 🐙 GitHub: [@Gtajisan](https://github.com/Gtajisan)

---

<p align="center">
  Made with 💖 by Gtajisan • © 2025
</p>
