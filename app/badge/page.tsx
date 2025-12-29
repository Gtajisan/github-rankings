"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Check, ExternalLink, Sparkles } from "lucide-react"
import Link from "next/link"

const themes = [
  { id: "dark", name: "Dark", preview: "bg-[#0d1117]" },
  { id: "light", name: "Light", preview: "bg-white" },
  { id: "gradient", name: "Gradient", preview: "bg-gradient-to-r from-indigo-900 to-purple-900" },
  { id: "midnight", name: "Midnight", preview: "bg-[#0f0f1a]" },
  { id: "ocean", name: "Ocean", preview: "bg-[#0c1929]" },
  { id: "sunset", name: "Sunset", preview: "bg-[#1a0a0a]" },
] as const

type ThemeId = (typeof themes)[number]["id"]

function BadgePage() {
  const [username, setUsername] = useState("")
  const [previewUsername, setPreviewUsername] = useState("anbuinfosec")
  const [theme, setTheme] = useState<ThemeId>("dark")
  const [copied, setCopied] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [worldwide, setWorldwide] = useState(false)

  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
  const badgeUrl = `${baseUrl}/api/badge/${previewUsername}?theme=${theme}${worldwide ? "&worldwide=true" : ""}`

  const markdownCode = `![GitHub Rank](${badgeUrl})`
  const htmlCode = `<img src="${badgeUrl}" alt="GitHub Rank" />`
  const linkCode = `[![GitHub Rank](${badgeUrl})](${baseUrl})`

  const handleGenerate = () => {
    if (username.trim()) {
      setPreviewUsername(username.trim())
      setRefreshKey((k) => k + 1)
    }
  }

  const handleCopy = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-foreground">
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>GitHub Rankings</span>
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm">
              <ExternalLink className="mr-2 h-4 w-4" />
              Back to Rankings
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary">
              <Sparkles className="h-4 w-4" />
              <span>Dynamic GitHub Badge</span>
            </div>
            <h1 className="text-4xl font-bold text-foreground">GitHub Country Rank Badge</h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Showcase your GitHub ranking in your country with a beautiful, dynamic badge for your profile README
            </p>
          </div>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                Generate Your Badge
              </CardTitle>
              <CardDescription>Enter your GitHub username to create a personalized rank badge</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter GitHub username (e.g., anbuinfosec)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                  className="h-11"
                />
                <Button onClick={handleGenerate} size="lg">
                  Generate
                </Button>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Choose Theme</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`relative flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all ${
                        theme === t.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <div className={`h-8 w-full rounded ${t.preview} border border-border`} />
                      <span className="text-xs font-medium">{t.name}</span>
                      {theme === t.id && <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Live Preview</label>
                <div className="flex items-center gap-4 mb-4">
                  <input
                    id="worldwide-toggle"
                    type="checkbox"
                    checked={worldwide}
                    onChange={() => setWorldwide((w) => !w)}
                    className="accent-primary h-4 w-4"
                  />
                  <label htmlFor="worldwide-toggle" className="text-sm select-none cursor-pointer">
                    Show Worldwide Rank
                  </label>
                </div>
                <div className="flex justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-8">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    key={`${previewUsername}-${theme}-${refreshKey}-${worldwide}`}
                    src={`/api/badge/${previewUsername}?theme=${theme}${worldwide ? "&worldwide=true" : ""}&v=${refreshKey}`}
                    alt="GitHub Rank Badge Preview"
                    className="max-w-full rounded-lg shadow-lg"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Embed Code</CardTitle>
              <CardDescription>Copy the code below to add the badge to your GitHub README</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="markdown" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="markdown">Markdown</TabsTrigger>
                  <TabsTrigger value="html">HTML</TabsTrigger>
                  <TabsTrigger value="link">With Link</TabsTrigger>
                </TabsList>

                {[
                  { id: "markdown", code: markdownCode, desc: "Best for GitHub README files" },
                  { id: "html", code: htmlCode, desc: "For websites and HTML documents" },
                  { id: "link", code: linkCode, desc: "Clickable badge linking to rankings" },
                ].map((item) => (
                  <TabsContent key={item.id} value={item.id} className="space-y-2">
                    <div className="relative group">
                      <pre className="overflow-x-auto rounded-lg bg-muted/80 border border-border p-4 pr-12 text-sm text-foreground font-mono">
                        <code className="break-all">{item.code}</code>
                      </pre>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute right-2 top-2 opacity-70 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleCopy(item.code, item.id)}
                      >
                        {copied === item.id ? (
                          <>
                            <Check className="h-4 w-4 mr-1" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-1" /> Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>URL Parameters</CardTitle>
              <CardDescription>Customize your badge with these options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-3 text-left font-semibold text-foreground">Parameter</th>
                      <th className="py-3 text-left font-semibold text-foreground">Values</th>
                      <th className="py-3 text-left font-semibold text-foreground">Default</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border">
                      <td className="py-3">
                        <code className="rounded bg-muted px-2 py-1 text-xs font-mono">theme</code>
                      </td>
                      <td className="py-3">dark, light, gradient, midnight, ocean, sunset</td>
                      <td className="py-3">dark</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Example URLs:</p>
                <div className="grid gap-2">
                  {[
                    "/api/badge/anbuinfosec?theme=dark",
                    "/api/badge/anbuinfosec?theme=ocean",
                    "/api/badge/anbuinfosec?theme=sunset",
                  ].map((url) => (
                    <code
                      key={url}
                      className="block rounded-lg bg-muted/80 border border-border px-3 py-2 text-xs font-mono text-muted-foreground"
                    >
                      {url}
                    </code>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      </div>
    )
  }
  
  export default BadgePage