"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowUpRight, ShieldCheck, Code, Smartphone, Cpu, BarChart3, Shield, Cloud, Terminal, CheckCircle2, Sparkles } from "lucide-react"

const iconMap: Record<string, any> = {
  code: Code,
  smartphone: Smartphone,
  cpu: Cpu,
  "bar-chart": BarChart3,
  shield: Shield,
  cloud: Cloud,
  terminal: Terminal,
}

export default function ServicesPage() {
  const [services, setServices] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    async function loadServices() {
      try {
        setLoading(true)
        const res = await fetch("/api/public/content/service")
        if (!res.ok) throw new Error("Failed to load services directory")
        const data = await res.json()
        setServices(data)
      } catch (err: any) {
        setError(err.message || "Failed to load services")
      } finally {
        setLoading(false)
      }
    }
    loadServices()
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="border-b rule">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-16">
          <p className="font-mono text-xs uppercase tracking-wide brass-text mb-6">Core services</p>
          <h1 className="font-display text-4xl sm:text-5xl max-w-2xl leading-[1.1] font-bold">
            Engineering, security, and operations — under one SLA
          </h1>
          <p className="mt-6 text-lg muted-text max-w-2xl leading-relaxed">
            Every engagement is a bespoke build, mapped to your existing security layers, billing structures, and offline procedures — then supported by our Abuja hub around the clock.
          </p>
        </div>
      </section>

      {/* Services Register */}
      <section className="border-b rule py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {loading ? (
            <div className="space-y-8">
              {/* Loader Header Banner */}
              <div className="flex items-center justify-center mb-6">
                <div className="inline-flex items-center gap-2.5 rounded-full border border-[var(--brass)]/30 bg-[var(--brass)]/10 px-4 py-1.5 font-mono text-xs text-[var(--brass)] shadow-sm">
                  <div className="h-2 w-2 rounded-full bg-[var(--brass)] animate-ping" />
                  <span>Loading sovereign core services register from database...</span>
                </div>
              </div>

              {/* Skeleton Services Ledger Rows */}
              <div className="border-t rule-strong divide-y rule">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="grid sm:grid-cols-12 gap-6 py-8">
                    <div className="sm:col-span-1 pt-1">
                      <div className="h-4 w-14 rounded bg-[var(--surface-2)] animate-pulse" />
                    </div>
                    <div className="sm:col-span-4 flex items-start gap-3">
                      <div className="w-5 h-5 rounded bg-[var(--brass)]/20 animate-pulse mt-1 shrink-0" />
                      <div className="h-6 w-3/4 rounded bg-[var(--surface-2)] animate-pulse" />
                    </div>
                    <div className="sm:col-span-7 space-y-2">
                      <div className="h-3.5 w-full rounded bg-[var(--surface-2)] animate-pulse" />
                      <div className="h-3.5 w-5/6 rounded bg-[var(--surface-2)] animate-pulse" />
                      <div className="h-3.5 w-2/3 rounded bg-[var(--surface-2)] animate-pulse" />
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
          ) : services.length === 0 ? (
            <div className="py-16 text-center font-mono text-xs muted-text">
              No core services registered in the database catalog.
            </div>
          ) : (
            <div className="border-t rule-strong">
              {services.map((svc, idx) => {
                const IconComponent = iconMap[svc.icon || ""] || Code
                return (
                  <div key={svc._id || idx} className="ledger-row grid sm:grid-cols-12 gap-6 py-8">
                    <div className="sm:col-span-1 font-mono text-xs muted-text pt-1">
                      SVC-{String(idx + 1).padStart(2, "0")}
                    </div>
                    <div className="sm:col-span-4 flex items-start gap-3">
                      <IconComponent className="w-5 h-5 brass-text mt-1 shrink-0" />
                      <h3 className="font-display text-xl font-bold">{svc.title}</h3>
                    </div>
                    <p className="sm:col-span-7 text-sm muted-text leading-relaxed">
                      {svc.description}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* SLA Guarantees */}
      <section className="border-b rule bg-surface py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="font-mono text-xs uppercase tracking-wide teal-text mb-3">Service Level Agreement</p>
            <h2 className="font-display text-3xl font-bold">Guaranteed operational parameters</h2>
            <p className="mt-3 text-sm muted-text">
              We stand behind our platforms with contractually enforceable service level agreements.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded border rule bg-[var(--bg)] p-6">
              <span className="font-display text-3xl font-bold brass-text">99.9%</span>
              <h4 className="font-display text-base font-semibold mt-2">Platform Availability</h4>
              <p className="text-xs muted-text mt-2 leading-relaxed">
                Continuous monitoring with automated failover across sovereign multi-region nodes.
              </p>
            </div>
            <div className="rounded border rule bg-[var(--bg)] p-6">
              <span className="font-display text-3xl font-bold brass-text">&lt; 15m</span>
              <h4 className="font-display text-base font-semibold mt-2">Incident Response</h4>
              <p className="text-xs muted-text mt-2 leading-relaxed">
                Direct hotline to senior engineering staff at our Abuja Operations Hub 24/7/365.
              </p>
            </div>
            <div className="rounded border rule bg-[var(--bg)] p-6">
              <span className="font-display text-3xl font-bold brass-text">100%</span>
              <h4 className="font-display text-base font-semibold mt-2">Data Sovereignty</h4>
              <p className="text-xs muted-text mt-2 leading-relaxed">
                In-country cryptographic storage compliant with national regulatory statutes.
              </p>
            </div>
            <div className="rounded border rule bg-[var(--bg)] p-6">
              <span className="font-display text-3xl font-bold brass-text">Zero</span>
              <h4 className="font-display text-base font-semibold mt-2">Template Drift</h4>
              <p className="text-xs muted-text mt-2 leading-relaxed">
                Proprietary source code ownership with complete architectural handover documentation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-display text-3xl font-bold">Have an engagement to discuss?</h2>
          <p className="mt-3 text-sm muted-text">
            Submit your scope or request a technical consultation from our engineers.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/contact" className="btn-brass inline-flex items-center gap-2 px-6 py-3 rounded-sm font-semibold text-sm">
              <span>Initiate consultation</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
