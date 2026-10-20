"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Shield, KeyRound, User, ArrowRight } from "lucide-react"

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = React.useState("cto@tr3-g.com.ng")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Login failed")
      }

      router.push("/admin")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Failed to sign in")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4 py-12">
      <div className="w-full max-w-md rounded-lg border rule-strong bg-[var(--surface)] p-8 shadow-2xl">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded bg-[var(--brass)]/15 px-2.5 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-[var(--brass)] border border-[var(--brass)]/30">
            <Shield className="h-3.5 w-3.5" />
            CONTROL PLANE
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-[var(--ink)]">
            Admin Sign In
          </h1>
          <p className="mt-2 text-sm text-[var(--muted-custom)]">
            Authenticate to manage services, solutions, team, alliances, staff and recruitment.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-mono text-xs uppercase tracking-wider text-[var(--muted-custom)]">
              Username
            </label>
            <div className="relative mt-2">
              <User className="absolute left-3 top-3 h-4 w-4 text-[var(--muted-custom)]" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full rounded-md border rule bg-[var(--bg)] py-2.5 pl-10 pr-3 font-sans text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)] focus:ring-1 focus:ring-[var(--brass)]"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs uppercase tracking-wider text-[var(--muted-custom)]">
              Password
            </label>
            <div className="relative mt-2">
              <KeyRound className="absolute left-3 top-3 h-4 w-4 text-[var(--muted-custom)]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-md border rule bg-[var(--bg)] py-2.5 pl-10 pr-3 font-sans text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)] focus:ring-1 focus:ring-[var(--brass)]"
              />
            </div>
            <p className="mt-1 font-mono text-[11px] text-[var(--muted-custom)]">
              Secured with Argon2 password hashing
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-brass flex w-full items-center justify-center gap-2 rounded-md py-3 text-sm font-semibold transition-all disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign in to Control Plane</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 border-t rule pt-4 text-center">
          <p className="font-mono text-[11px] text-[var(--muted-custom)]">
            Default credentials: <code className="text-[var(--brass)]">admin</code> / <code className="text-[var(--brass)]">admin123</code>
          </p>
        </div>
      </div>
    </div>
  )
}
