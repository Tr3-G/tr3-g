"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowUpRight, Cpu, Layers, Terminal, Sparkles } from "lucide-react"

export default function StackPage() {
  const [layers, setLayers] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    async function loadStack() {
      try {
        setLoading(true)
        const res = await fetch("/api/public/content/stack")
        if (!res.ok) throw new Error("Failed to load stack architecture")
        const data = await res.json()
        setLayers(data)
      } catch (err: any) {
        setError(err.message || "Failed to load technology stack")
      } finally {
        setLoading(false)
      }
    }
    loadStack()
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="border-b rule">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-16">
          <p className="font-mono text-xs uppercase tracking-wide brass-text mb-6">Engineering Stack</p>
          <h1 className="font-display text-4xl sm:text-5xl max-w-2xl leading-[1.1] font-bold">
            Built for durability, speed, and cryptographic sovereignty
          </h1>
          <p className="mt-6 text-lg muted-text max-w-2xl leading-relaxed">
            We select tools based on operational reliability in challenging infrastructure environments — zero bloat, native binary compilation, and memory-hard security.
          </p>
        </div>
      </section>

      {/* Layers */}
      <section className="border-b rule py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-16">
          {loading ? (
            <div className="space-y-12">
              {/* Loader Header Banner */}
              <div className="flex items-center justify-center">
                <div className="inline-flex items-center gap-2.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 font-mono text-xs teal-text shadow-sm">
                  <div className="h-2 w-2 rounded-full bg-teal-400 animate-ping" />
                  <span>Loading engineering stack & cryptographic layers from database...</span>
                </div>
              </div>

              {/* Skeleton Stack Layers */}
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-lg border rule bg-[var(--surface)] p-8 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b rule pb-6">
                    <div className="space-y-2">
                      <div className="h-4 w-20 rounded bg-teal-500/20 animate-pulse" />
                      <div className="h-7 w-64 rounded bg-[var(--surface-2)] animate-pulse" />
                    </div>
                    <div className="h-4 w-80 rounded bg-[var(--surface-2)] animate-pulse" />
                  </div>

                  <div className="mt-6 grid sm:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="rounded border rule bg-[var(--surface-2)] p-4 space-y-2">
                        <div className="h-4 w-36 rounded bg-[var(--brass)]/20 animate-pulse" />
                        <div className="h-3 w-5/6 rounded bg-[var(--surface)] animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
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
          ) : (
            layers.map((layer, idx) => {
              const meta = layer.meta || {}
              const technologies = meta.technologies || []
              const layerTag = meta.layer || `LAYER 0${idx + 1}`

              return (
                <div key={layer._id || idx} className="rounded-lg border rule bg-[var(--surface)] p-8 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b rule pb-6">
                    <div>
                      <span className="font-mono text-xs teal-text font-bold uppercase tracking-wider">{layerTag}</span>
                      <h2 className="font-display text-2xl font-bold mt-1 text-[var(--ink)]">{layer.title}</h2>
                    </div>
                    <p className="text-xs text-[var(--muted-custom)] max-w-md">
                      {layer.description}
                    </p>
                  </div>

                  <div className="mt-6 grid sm:grid-cols-2 gap-4">
                    {technologies.map((t: any, tIdx: number) => (
                      <div key={tIdx} className="rounded border rule bg-[var(--surface-2)] p-4">
                        <h3 className="font-mono text-sm font-bold text-[var(--ink)] brass-text">{t.name}</h3>
                        <p className="text-xs text-[var(--muted-custom)] mt-1 leading-relaxed">{t.role}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-display text-3xl font-bold">Need a specialized architecture review?</h2>
          <p className="mt-3 text-sm muted-text">
            Our principal engineers are available to review existing codebases and security perimeters.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/contact" className="btn-brass inline-flex items-center gap-2 px-6 py-3 rounded-sm font-semibold text-sm">
              <span>Schedule technical audit</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
