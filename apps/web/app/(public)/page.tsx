import Link from "next/link"
import { ArrowUpRight, Shield, Terminal, CheckCircle2, Layers, Cpu, Code2 } from "lucide-react"
import { getContentList } from "@/lib/db"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const [services, solutions, partners] = await Promise.all([
    getContentList("service"),
    getContentList("solution"),
    getContentList("partner"),
  ])

  return (
    <div>
      {/* HERO SECTION */}
      <section className="relative overflow-hidden border-b rule">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-20 pb-16 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7">
            <p className="font-mono text-xs uppercase tracking-wide brass-text mb-6">
              Next-gen enterprise platforms
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.08] font-extrabold tracking-tight">
              Developing software foundations for global leaders
            </h1>
            <p className="mt-6 text-lg muted-text max-w-xl leading-relaxed">
              TR3-G Innovations Limited designs and builds custom high-performance digital ecosystems — moving organizations past offline constraints, with automated, bulletproof platforms.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="btn-brass inline-flex items-center gap-2 px-6 py-3 rounded-sm font-semibold"
              >
                <span>Initiate consultation</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/solutions"
                className="btn-outline inline-flex items-center gap-2 px-6 py-3 rounded-sm font-medium"
              >
                <span>Explore solutions</span>
              </Link>
            </div>

            <div className="mt-14 grid grid-cols-3 max-w-md border-t rule-strong pt-6">
              <div>
                <p className="font-display text-3xl font-bold brass-text">11+</p>
                <p className="font-mono text-[11px] uppercase tracking-wide muted-text mt-1">Alliances</p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold brass-text">99.9%</p>
                <p className="font-mono text-[11px] uppercase tracking-wide muted-text mt-1">Platform uptime</p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold brass-text">24/7</p>
                <p className="font-mono text-[11px] uppercase tracking-wide muted-text mt-1">Enterprise SLA</p>
              </div>
            </div>
          </div>

          {/* Terminal / System Console Panel */}
          <div className="lg:col-span-5">
            <div className="bg-surface border rule-strong rounded-sm overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-5 py-3 border-b rule bg-surface-2">
                <div className="flex items-center gap-2">
                  <Terminal className="h-3.5 w-3.5 muted-text" />
                  <p className="font-mono text-[11px] muted-text">tr3g-core-engine</p>
                </div>
                <span className="font-mono text-[10px] teal-text font-bold">SERVICE_v4.2_ACTIVE</span>
              </div>
              <div className="p-5 font-mono text-[12.5px] leading-relaxed">
                <p className="muted-text">$ tr3g-core-engine initialize</p>
                <p className="mt-2 text-emerald-400">✓ Secure connection protocols mapped</p>
                <p className="text-emerald-400">✓ NeDB persistent datastore locked</p>
                <p className="text-emerald-400">✓ Argon2 cryptographic hash verified</p>
                <p className="mt-4 muted-text">Analyzing continuous stream optimization logs…</p>

                <div className="mt-5 pt-5 border-t rule space-y-3">
                  <p className="text-[11px] uppercase tracking-wide muted-text">Deployed ecosystems</p>
                  <div className="flex items-center justify-between">
                    <span>Arqelion Access</span>
                    <span className="teal-text text-[11px] font-bold">ACTIVE</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Revenue Portal</span>
                    <span className="brass-text text-[11px] font-bold">SECURED</span>
                  </div>
                </div>

                <div className="mt-5 pt-5 border-t rule flex items-center gap-2">
                  <Shield className="h-4 w-4 brass-text" />
                  <span className="text-xs">100% secure — verified infrastructure</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE CAPABILITIES REGISTER */}
      <section className="border-b rule py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="font-mono text-xs uppercase tracking-wide brass-text mb-3">Capabilities</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
                Architectural engineering under one SLA
              </h2>
            </div>
            <Link href="/services" className="font-mono text-xs brass-text hover:underline inline-flex items-center gap-1">
              <span>View full service register</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="border-t rule-strong">
            {services.slice(0, 4).map((svc, idx) => (
              <div key={svc._id || idx} className="ledger-row grid sm:grid-cols-12 gap-6 py-8">
                <div className="sm:col-span-1 font-mono text-xs muted-text pt-1">
                  SVC-{String(idx + 1).padStart(2, "0")}
                </div>
                <div className="sm:col-span-4 flex items-start gap-3">
                  <Code2 className="h-5 w-5 brass-text shrink-0 mt-1" />
                  <h3 className="font-display text-xl font-bold">{svc.title}</h3>
                </div>
                <p className="sm:col-span-7 text-sm muted-text leading-relaxed">
                  {svc.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEPLOYED ECOSYSTEMS SHOWCASE */}
      <section className="border-b rule py-20 bg-[var(--surface)]/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="font-mono text-xs uppercase tracking-wide teal-text mb-3">Production Environments</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
                Deployed digital ecosystems
              </h2>
            </div>
            <Link href="/solutions" className="font-mono text-xs brass-text hover:underline inline-flex items-center gap-1">
              <span>Explore all solutions</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {solutions.slice(0, 2).map((sol, idx) => (
              <div key={sol._id || idx} className="bg-surface border rule-strong rounded-sm p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-display text-2xl font-bold">{sol.title}</h3>
                    <span className="font-mono text-[11px] teal-text border rule-strong px-2 py-1 rounded-sm font-semibold">
                      {sol.meta?.status || "ACTIVE"}
                    </span>
                  </div>
                  <p className="mt-4 text-sm muted-text leading-relaxed">
                    {sol.description}
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t rule flex items-center justify-between font-mono text-xs muted-text">
                  <span>Zero-trust protocol</span>
                  <span className="teal-text">Verified Architecture</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STRATEGIC ALLIANCES PREVIEW */}
      <section className="border-b rule py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="font-mono text-xs uppercase tracking-wide brass-text mb-3">Institutional Network</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
              Trusted by enterprise & public institutions
            </h2>
            <p className="mt-4 text-sm muted-text">
              11+ alliances across government ministries, state revenue boards, innovation ecosystems, and multinational infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {partners.slice(0, 8).map((p, idx) => (
              <div
                key={p._id || idx}
                className="rounded border rule bg-surface p-4 flex flex-col items-center justify-center text-center hover:border-[var(--brass)] transition-colors min-h-[110px]"
              >
                {p.image_id ? (
                  <img
                    src={`/api/images/${p.image_id}`}
                    alt={p.title}
                    className="h-9 w-auto object-contain max-w-[120px]"
                  />
                ) : (
                  <span className="seal w-8 h-8 flex items-center justify-center text-[var(--brass)]">
                    <Shield className="h-4 w-4" />
                  </span>
                )}
                <span className="font-display text-xs font-semibold mt-2 line-clamp-1">{p.title}</span>
                <span className="font-mono text-[10px] teal-text">{p.meta?.code || "ALLIANCE"}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/partners" className="btn-outline inline-flex items-center gap-2 rounded-sm px-5 py-2.5 text-xs font-mono">
              <span>View all 11+ partner profiles</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="font-mono text-xs uppercase tracking-wide brass-text mb-4">
            ABUJA OPERATIONS HUB
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            Ready to deploy enterprise infrastructure?
          </h2>
          <p className="mt-4 text-sm sm:text-base muted-text max-w-xl mx-auto leading-relaxed">
            Consult with our engineering team to design, secure, and operate your mission-critical software ecosystems.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="btn-brass inline-flex items-center gap-2 rounded-sm px-6 py-3 font-semibold text-sm"
            >
              <span>Initiate consultation</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/stack"
              className="btn-outline inline-flex items-center gap-2 rounded-sm px-6 py-3 font-medium text-sm"
            >
              <span>Review technology stack</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
