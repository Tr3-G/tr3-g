"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowUpRight, Users, Sparkles, RefreshCw } from "lucide-react"

export default function TeamPage() {
  const [team, setTeam] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    async function loadTeam() {
      try {
        setLoading(true)
        const res = await fetch("/api/public/content/team")
        if (!res.ok) throw new Error("Failed to load engineering leadership directory")
        const data = await res.json()
        setTeam(data)
      } catch (err: any) {
        setError(err.message || "Failed to load team")
      } finally {
        setLoading(false)
      }
    }
    loadTeam()
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="border-b rule">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-16">
          <p className="font-mono text-xs uppercase tracking-wide brass-text mb-6">Engineering Leadership</p>
          <h1 className="font-display text-4xl sm:text-5xl max-w-2xl leading-[1.1] font-bold">
            The engineers and strategists building sovereign software
          </h1>
          <p className="mt-6 text-lg muted-text max-w-2xl leading-relaxed">
            Our leadership brings together veteran systems engineers, distributed databases researchers, and public sector technology strategists based at our Abuja Operations Hub.
          </p>
        </div>
      </section>

      {/* Team Grid */}
      <section className="border-b rule py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {loading ? (
            <div className="space-y-10">
              {/* Loader Header Banner */}
              <div className="flex items-center justify-center">
                <div className="inline-flex items-center gap-2.5 rounded-full border border-[var(--brass)]/30 bg-[var(--brass)]/10 px-4 py-1.5 font-mono text-xs text-[var(--brass)] shadow-sm">
                  <div className="h-2 w-2 rounded-full bg-[var(--brass)] animate-ping" />
                  <span>Synchronizing engineering leadership registry from database...</span>
                </div>
              </div>

              {/* Skeleton Cards Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="rounded-sm border rule-strong bg-[var(--surface)] p-4 shadow-sm overflow-hidden">
                    <div className="aspect-square bg-[var(--surface-2)] rounded-sm animate-pulse flex items-center justify-center">
                      <Users className="w-12 h-12 text-[var(--muted-custom)]/20" />
                    </div>
                    <div className="mt-5 space-y-3">
                      <div className="h-6 w-3/4 bg-[var(--surface-2)] animate-pulse rounded" />
                      <div className="h-4 w-1/2 bg-[var(--brass)]/20 animate-pulse rounded" />
                      <div className="space-y-1.5 pt-1">
                        <div className="h-3 w-full bg-[var(--surface-2)] animate-pulse rounded" />
                        <div className="h-3 w-5/6 bg-[var(--surface-2)] animate-pulse rounded" />
                        <div className="h-3 w-2/3 bg-[var(--surface-2)] animate-pulse rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="py-16 text-center">
              <div className="inline-flex items-center gap-2 rounded border border-red-500/30 bg-red-500/10 p-4 font-mono text-xs text-red-400">
                <span>{error}</span>
                <button
                  onClick={() => window.location.reload()}
                  className="underline hover:text-red-300 ml-2"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : team.length === 0 ? (
            <div className="py-16 text-center font-mono text-xs muted-text">
              No leadership profiles currently published in the sovereign directory.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {team.map((member, idx) => (
                <div key={member._id || idx} className="group">
                  <div className="aspect-square bg-surface border rule-strong rounded-sm flex items-center justify-center overflow-hidden transition-all group-hover:border-[var(--brass)] shadow-md">
                    {member.image_id ? (
                      <img
                        src={member.image_id.startsWith("http") ? member.image_id : `/api/images/${member.image_id}`}
                        alt={member.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users className="w-16 h-16 text-[var(--muted-custom)] opacity-40" />
                    )}
                  </div>

                  <div className="mt-5">
                    <h3 className="font-display text-xl font-bold text-[var(--ink)]">{member.title}</h3>
                    <p className="font-mono text-xs uppercase tracking-wide teal-text mt-1 font-semibold">
                      {member.meta?.role || member.body || "Core Engineer"}
                    </p>
                    <p className="text-sm muted-text mt-3 leading-relaxed">
                      {member.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recruitment CTA */}
      <section className="py-20 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-display text-3xl font-bold">Want to build with us?</h2>
          <p className="mt-3 text-sm muted-text">
            We are always scouting for exceptional systems engineers, cryptographers, and backend architects.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/careers" className="btn-brass inline-flex items-center gap-2 px-6 py-3 rounded-sm font-semibold text-sm">
              <span>View open positions</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
