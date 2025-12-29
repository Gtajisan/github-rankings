module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/github-api.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateMockContributions",
    ()=>generateMockContributions,
    "getMultipleUserDetails",
    ()=>getMultipleUserDetails,
    "getRateLimitInfo",
    ()=>getRateLimitInfo,
    "getUserDetails",
    ()=>getUserDetails,
    "isRateLimited",
    ()=>isRateLimited,
    "searchUsersByLocation",
    ()=>searchUsersByLocation
]);
const GITHUB_API_BASE = "https://api.github.com";
const cache = new Map();
const CACHE_TTL = 60 * 60 * 1000 // 1 hour
;
function getCached(key) {
    const entry = cache.get(key);
    if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
        return entry.data;
    }
    cache.delete(key);
    return null;
}
function setCache(key, data) {
    cache.set(key, {
        data,
        timestamp: Date.now()
    });
}
let rateLimitRemaining = 60;
let rateLimitReset = 0;
function updateRateLimitFromHeaders(headers) {
    const remaining = headers.get("x-ratelimit-remaining");
    const reset = headers.get("x-ratelimit-reset");
    if (remaining) rateLimitRemaining = Number.parseInt(remaining);
    if (reset) rateLimitReset = Number.parseInt(reset) * 1000;
}
function getAuthHeaders() {
    const token = process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN;
    if (!token) return {};
    // Prefer the `token` scheme for GitHub v3 API compatibility
    return {
        Authorization: `token ${token}`
    };
}
function isRateLimited() {
    return rateLimitRemaining <= 1 && Date.now() < rateLimitReset;
}
function getRateLimitInfo() {
    return {
        remaining: rateLimitRemaining,
        resetAt: rateLimitReset ? new Date(rateLimitReset).toISOString() : null,
        isLimited: isRateLimited()
    };
}
async function fetchWithRetry(url, options, retries = 2) {
    try {
        const response = await fetch(url, options);
        if (response.status === 504 && retries > 0) {
            // Exponential backoff
            await new Promise((resolve)=>setTimeout(resolve, (3 - retries) * 1000));
            return fetchWithRetry(url, options, retries - 1);
        }
        return response;
    } catch (error) {
        if (retries > 0) {
            await new Promise((resolve)=>setTimeout(resolve, (3 - retries) * 1000));
            return fetchWithRetry(url, options, retries - 1);
        }
        throw error;
    }
}
async function searchUsersByLocation(location, page = 1, perPage = 30) {
    const cacheKey = `search:${location}:${page}:${perPage}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;
    if (isRateLimited()) {
        throw new Error("RATE_LIMITED");
    }
    const query = encodeURIComponent(`location:${location} type:user`);
    const url = `${GITHUB_API_BASE}/search/users?q=${query}&sort=followers&order=desc&page=${page}&per_page=${perPage}`;
    const response = await fetchWithRetry(url, {
        headers: {
            Accept: "application/vnd.github.v3+json",
            ...getAuthHeaders()
        }
    });
    updateRateLimitFromHeaders(response.headers);
    if (response.status === 403) {
        throw new Error("RATE_LIMITED");
    }
    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
    }
    const data = await response.json();
    setCache(cacheKey, data);
    return data;
}
async function getUserDetails(username) {
    const cacheKey = `user:${username}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;
    if (isRateLimited()) {
        throw new Error("RATE_LIMITED");
    }
    const url = `${GITHUB_API_BASE}/users/${username}`;
    const response = await fetchWithRetry(url, {
        headers: {
            Accept: "application/vnd.github.v3+json",
            ...getAuthHeaders()
        }
    });
    updateRateLimitFromHeaders(response.headers);
    if (response.status === 403) {
        throw new Error("RATE_LIMITED");
    }
    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
    }
    const data = await response.json();
    setCache(cacheKey, data);
    return data;
}
async function getMultipleUserDetails(usernames) {
    const results = [];
    for (const username of usernames){
        try {
            const user = await getUserDetails(username);
            results.push(user);
        } catch (error) {
            if (error instanceof Error && error.message === "RATE_LIMITED") {
                break; // Stop fetching if rate limited
            }
        }
    }
    return results;
}
function generateMockContributions(user) {
    const baseContributions = Math.floor(user.public_repos * 50 + user.followers * 2);
    return {
        ...user,
        public_contributions: baseContributions + Math.floor(Math.random() * 500),
        total_contributions: baseContributions + Math.floor(Math.random() * 2000) + 500
    };
}
}),
"[project]/lib/sample-data.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sampleUsers",
    ()=>sampleUsers
]);
const sampleUsers = [
    {
        login: "torvalds",
        id: 1024025,
        avatar_url: "https://avatars.githubusercontent.com/u/1024025?v=4",
        html_url: "https://github.com/torvalds",
        name: "Linus Torvalds",
        company: "Linux Foundation",
        blog: "http://linuxfoundation.org",
        location: "Portland, OR",
        bio: "The creator of Linux and Git.",
        twitter_username: null,
        public_repos: 7,
        public_gists: 0,
        followers: 198000,
        following: 0,
        created_at: "2011-09-03T15:26:22Z",
        public_contributions: 5432,
        total_contributions: 12456
    },
    {
        login: "gaearon",
        id: 810438,
        avatar_url: "https://avatars.githubusercontent.com/u/810438?v=4",
        html_url: "https://github.com/gaearon",
        name: "Dan Abramov",
        company: "@meta",
        blog: "https://overreacted.io",
        location: "London, UK",
        bio: "Working on React.",
        twitter_username: "dan_abramov",
        public_repos: 265,
        public_gists: 78,
        followers: 85000,
        following: 172,
        created_at: "2011-05-25T18:18:31Z",
        public_contributions: 3210,
        total_contributions: 8765
    },
    {
        login: "yyx990803",
        id: 499550,
        avatar_url: "https://avatars.githubusercontent.com/u/499550?v=4",
        html_url: "https://github.com/yyx990803",
        name: "Evan You",
        company: "Vue.js",
        blog: "http://evanyou.me",
        location: "Singapore",
        bio: "Creator of Vue.js and Vite.",
        twitter_username: "youyuxi",
        public_repos: 185,
        public_gists: 65,
        followers: 102000,
        following: 95,
        created_at: "2010-11-28T01:04:15Z",
        public_contributions: 4567,
        total_contributions: 9876
    }
];
}),
"[project]/app/api/github/users/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$github$2d$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/github-api.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sample$2d$data$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/sample-data.ts [app-route] (ecmascript)");
;
;
;
async function GET(request) {
    const searchParams = request.nextUrl.searchParams;
    let country = searchParams.get("country") ?? "";
    const page = Number.parseInt(searchParams.get("page") || "1");
    // If no country or country is 'all' or 'world', treat as global search
    const isWorld = !country || country.toLowerCase() === "all" || country.toLowerCase() === "world";
    if (isWorld) country = ""; // empty string disables location filter
    try {
        // Search for users by location
        const searchResults = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$github$2d$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["searchUsersByLocation"])(country, page, 10);
        // Get detailed info for each user
        const usernames = searchResults.items.map((user)=>user.login);
        const detailedUsers = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$github$2d$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMultipleUserDetails"])(usernames);
        // Add mock contributions
        const usersWithContributions = detailedUsers.map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$github$2d$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateMockContributions"]);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            users: usersWithContributions,
            total_count: searchResults.total_count,
            page,
            rateLimitInfo: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$github$2d$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getRateLimitInfo"])(),
            isLiveData: true
        });
    } catch (error) {
        console.error("GitHub API error:", error);
        // Fallback to sample data for ANY error to keep the app working
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            users: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sample$2d$data$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sampleUsers"],
            total_count: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sample$2d$data$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sampleUsers"].length,
            page: 1,
            rateLimitInfo: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$github$2d$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getRateLimitInfo"])(),
            isLiveData: false,
            message: error instanceof Error && error.message === "RATE_LIMITED" ? "GitHub API rate limit reached. Showing sample data." : "Failed to fetch from GitHub. Showing sample data."
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__dae2f6ca._.js.map