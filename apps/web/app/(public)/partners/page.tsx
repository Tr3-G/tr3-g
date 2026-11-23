"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowUpRight, Shield, Layers, Handshake, Sparkles } from "lucide-react"

export default function PartnersPage() {
  const [partners, setPartners] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    async function loadPartners() {
      try {
        setLoading(true)
        const res = await fetch("/api/public/content/partner")
        if (!res.ok) throw new Error("Failed to load strategic alliances register")
        const data = await res.json()
        setPartners(data)
      } catch (err: any) {
        setError(err.message || "Failed to load partners")
      } finally {
        setLoading(false)
      }
    }
    loadPartners()
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="border-b rule">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-16">
          <p className="font-mono text-xs uppercase tracking-wide brass-text mb-6">Strategic Alliances</p>
          <h1 className="font-display text-4xl sm:text-5xl max-w-2xl leading-[1.1] font-bold">
            Trusted by ministries, state revenue boards, and innovation ecosystems
          </h1>
          <p className="mt-6 text-lg muted-text max-w-2xl leading-relaxed">
            Every alliance represents a live production deployment — handling real citizen transactions, sovereign records, and institutional scale.
          </p>
        </div>
      </section>

      {/* Partners Grid */}
      <section className="border-b rule py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {loading ? (
            <div className="space-y-10">
              {/* Loader Header Banner */}
              <div className="flex items-center justify-center">
                <div className="inline-flex items-center gap-2.5 rounded-full border border-[var(--brass)]/30 bg-[var(--brass)]/10 px-4 py-1.5 font-mono text-xs text-[var(--brass)] shadow-sm">
                  <div className="h-2 w-2 rounded-full bg-[var(--brass)] animate-ping" />
                  <span>Loading strategic alliance directory from sovereign database...</span>
                </div>
              </div>

              {/* Skeleton Partners Grid */}
              <div className="grid md:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-sm border rule-strong bg-[var(--surface)] p-8 shadow-sm">
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <div className="w-12 h-12 rounded bg-[var(--surface-2)] animate-pulse flex items-center justify-center">
                        <Handshake className="w-5 h-5 text-[var(--muted-custom)]/20" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-20 rounded bg-[var(--brass)]/20 animate-pulse" />
                        <div className="h-5 w-16 rounded bg-[var(--surface-2)] animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-7 w-3/4 bg-[var(--surface-2)] animate-pulse rounded" />
                      <div className="h-4 w-1/3 bg-teal-500/20 animate-pulse rounded" />
                      <div className="space-y-1.5 pt-2">
                        <div className="h-3 w-full bg-[var(--surface-2)] animate-pulse rounded" />
                        <div className="h-3 w-5/6 bg-[var(--surface-2)] animate-pulse rounded" />
                        <div className="h-3 w-4/6 bg-[var(--surface-2)] animate-pulse rounded" />
                      </div>
                    </div>
                    <div className="mt-8 pt-4 border-t rule flex items-center justify-between">
                      <div className="h-3 w-24 bg-[var(--surface-2)] animate-pulse rounded" />
                      <div className="h-3 w-32 bg-teal-500/20 animate-pulse rounded" />
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
          ) : partners.length === 0 ? (
            <div className="py-16 text-center font-mono text-xs muted-text">
              No strategic alliances registered currently.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {partners.map((partner, idx) => {
                const meta = partner.meta || {}
                const isFeatured =
                  meta.featured === "yes" ||
                  partner.body === "Featured alliance" ||
                  partner.slug === "ogun-state-ogirs"
                const code = meta.code || `ALL-${String(idx + 1).padStart(2, "0")}`
                const category =
                  meta.category ||
                  (partner.body && partner.body !== "Alliance category" && partner.body !== "Featured alliance"
                    ? partner.body
                    : isFeatured
                    ? "Public Sector Alliance"
                    : "Strategic Alliance")

                return (
                  <div
                    key={partner._id || idx}
                    className={`bg-surface rounded-sm p-8 flex flex-col justify-between transition-colors shadow-md ${
                      isFeatured
                        ? "border-2 border-[var(--brass)]/60 md:col-span-2 bg-[var(--surface-2)]/30"
                        : "border rule-strong hover:border-[var(--brass)]"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-6">
                        <span className="seal w-12 h-12 flex items-center justify-center shrink-0 bg-[var(--surface)]">
                          {partner.image_id ? (
                            <img
                              src={partner.image_id.startsWith("http") ? partner.image_id : `/api/images/${partner.image_id}`}
                              alt={partner.title}
                              className="w-full h-full object-contain p-1.5"
                            />
                          ) : (
                            <Handshake className="w-5 h-5 brass-text" />
                          )}
                        </span>

                        <div className="flex flex-wrap items-center gap-2 justify-end">
                          {isFeatured && (
                            <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-sm bg-[var(--brass)]/15 brass-text border border-[var(--brass)]/40 font-bold">
                              Featured Alliance
                            </span>
                          )}
                          <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm border rule-strong teal-text font-semibold">
                            {code}
                          </span>
                        </div>
                      </div>

                      <h3 className="font-display text-2xl font-bold text-[var(--ink)]">{partner.title}</h3>
                      <p className="font-mono text-xs teal-text mt-1.5 font-semibold">{category}</p>
                      <p className="mt-4 text-sm muted-text leading-relaxed">
                        {partner.description}
                      </p>
                    </div>

                    <div className="mt-8 pt-4 border-t rule flex items-center justify-between text-xs font-mono muted-text">
                      <span>Operational Scope</span>
                      <span className="teal-text font-semibold">
                        {isFeatured ? "State Scale / 24/7 SLA" : meta.status || "Active SLA Deployment"}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Alliance Verification CTA */}
      <section className="py-20 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-display text-3xl font-bold">Inquire about institutional alliances</h2>
          <p className="mt-3 text-sm muted-text">
            Our Abuja hub coordinates technical and strategic integration pipelines with government institutions.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/contact" className="btn-brass inline-flex items-center gap-2 px-6 py-3 rounded-sm font-semibold text-sm">
              <span>Initiate alliance inquiry</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
