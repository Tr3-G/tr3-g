import Link from "next/link"
import { ArrowUpRight, ShieldCheck, Check, Cpu, Lock, Database, Server } from "lucide-react"
import { getContentList } from "@/lib/db"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Digital Solutions - TR3-G Innovations Limited",
  description: "Deployed digital platforms including Arqelion Access, Revenue Portal, and enterprise security frameworks.",
}

export default async function SolutionsPage() {
  const solutions = await getContentList("solution")

  return (
    <div>
      {/* Hero */}
      <section className="border-b rule">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-16">
          <p className="font-mono text-xs uppercase tracking-wide brass-text mb-6">Digital solutions</p>
          <h1 className="font-display text-4xl sm:text-5xl max-w-2xl leading-[1.1] font-bold">
            Ecosystems already running in production
          </h1>
          <p className="mt-6 text-lg muted-text max-w-2xl leading-relaxed">
            Our deployed platforms show what a TR3-G solution looks like once it's live, secured, and operating under a 24/7 SLA.
          </p>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="border-b rule py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid md:grid-cols-2 gap-8">
          {solutions.map((sol, idx) => (
            <div
              key={sol._id || idx}
              className="bg-surface border rule-strong rounded-sm p-8 flex flex-col justify-between hover:border-[var(--brass)] transition-colors shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-display text-2xl font-bold">{sol.title}</h3>
                  <span className="font-mono text-[11px] teal-text border rule-strong px-2.5 py-1 rounded-sm font-semibold">
                    {sol.meta?.status || "ACTIVE"}
                  </span>
                </div>

                <p className="mt-4 text-sm muted-text leading-relaxed">
                  {sol.description}
                </p>

                <ul className="mt-6 space-y-2.5 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 brass-text shrink-0" />
                    <span>Zero-trust identity verification</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 brass-text shrink-0" />
                    <span>Real-time cryptographic audit logging</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 brass-text shrink-0" />
                    <span>High-throughput collection engine</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t rule flex items-center justify-between font-mono text-xs muted-text">
                <span>Architecture</span>
                <span className="teal-text font-semibold">Verified Enterprise Protocol</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Institutional Tracks */}
      <section className="border-b rule bg-surface py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="font-mono text-xs uppercase tracking-wide teal-text mb-3">Solution Tracks</p>
            <h2 className="font-display text-3xl font-bold">Specialized deployment models</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="rounded border rule bg-[var(--bg)] p-6">
              <Lock className="w-6 h-6 brass-text mb-4" />
              <h4 className="font-display text-lg font-bold">Public Revenue Gateways</h4>
              <p className="mt-2 text-sm muted-text leading-relaxed">
                Automated multi-channel billing and reconciliation for state agencies and government boards.
              </p>
            </div>
            <div className="rounded border rule bg-[var(--bg)] p-6">
              <Database className="w-6 h-6 brass-text mb-4" />
              <h4 className="font-display text-lg font-bold">Proprietary Document Vaults</h4>
              <p className="mt-2 text-sm muted-text leading-relaxed">
                Encrypted storage and role-based access governance for institutional records and archives.
              </p>
            </div>
            <div className="rounded border rule bg-[var(--bg)] p-6">
              <Server className="w-6 h-6 brass-text mb-4" />
              <h4 className="font-display text-lg font-bold">Sovereign Data Infrastructure</h4>
              <p className="mt-2 text-sm muted-text leading-relaxed">
                Air-gapped and hybrid cloud topologies built to satisfy rigorous national data governance rules.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-display text-3xl font-bold">Ready to deploy a custom platform?</h2>
          <p className="mt-3 text-sm muted-text">
            Consult with our engineers to architect an ecosystem around your exact organizational needs.
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
