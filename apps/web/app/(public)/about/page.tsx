import Link from "next/link"
import { ArrowUpRight, Target, Eye, Layers, Shield, FileText, Lock, Server, CheckCircle2 } from "lucide-react"

export const metadata = {
  title: "About Us - TR3-G Innovations Limited",
  description: "Identity story, architectural philosophy, milestones, and institutional compliance standards of TR3-G Innovations Limited.",
}

export default function AboutPage() {
  return (
    <div>
      {/* Header */}
      <section className="border-b rule">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-16">
          <p className="font-mono text-xs uppercase tracking-wide brass-text mb-6">Identity story</p>
          <h1 className="font-display text-4xl sm:text-5xl max-w-2xl leading-[1.1] font-bold">
            A software house that treats infrastructure like a public trust
          </h1>
          <p className="mt-6 text-lg muted-text max-w-2xl leading-relaxed">
            TR3-G Innovations Limited was built on a simple premise: the institutions that run a country's revenue, records, and identity systems deserve engineering with the same rigor as any global platform — not a rebranded template.
          </p>
        </div>
      </section>

      {/* Origin Story */}
      <section className="border-b rule">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            <h2 className="font-display text-2xl font-bold mb-5">Where we started</h2>
            <p className="muted-text leading-relaxed">
              We began by working alongside government agencies still running on paper files and offline registers. Every early engagement — a state revenue office, a ministry's document archive — surfaced the same gap: off-the-shelf software could not hold up against the scale, security demands, and irregular connectivity of Nigerian public administration.
            </p>
            <p className="mt-4 muted-text leading-relaxed">
              So we stopped selling templates. TR3-G now designs full-stack ecosystems from the database layer up, mapped to each client's actual security posture, billing structure, and offline procedures — then operates them under a 24/7 SLA from our Abuja hub.
            </p>
          </div>
          <div className="lg:col-span-5">
            <div className="bg-surface border rule-strong rounded-sm p-8 shadow-lg">
              <p className="font-mono text-[11px] uppercase tracking-wide teal-text mb-6 font-semibold">At a glance</p>
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b rule pb-4">
                  <span className="text-sm muted-text">Operations hub</span>
                  <span className="font-mono text-sm font-semibold">Abuja, Nigeria</span>
                </div>
                <div className="flex items-center justify-between border-b rule pb-4">
                  <span className="text-sm muted-text">Alliances</span>
                  <span className="font-mono text-sm font-semibold brass-text">11+</span>
                </div>
                <div className="flex items-center justify-between border-b rule pb-4">
                  <span className="text-sm muted-text">Platform uptime</span>
                  <span className="font-mono text-sm font-semibold text-emerald-400">99.9%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm muted-text">Support model</span>
                  <span className="font-mono text-sm font-semibold">24/7 Enterprise SLA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission / Vision / Approach */}
      <section className="border-b rule bg-surface">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
          <div className="grid sm:grid-cols-3 gap-px bg-[var(--line)] border rule overflow-hidden rounded-sm">
            <div className="bg-[var(--bg)] p-8">
              <Target className="w-6 h-6 brass-text mb-4" />
              <h3 className="font-display text-xl font-bold">Mission</h3>
              <p className="mt-3 text-sm muted-text leading-relaxed">
                Move organizations past offline constraints with automated, bulletproof digital platforms.
              </p>
            </div>
            <div className="bg-[var(--bg)] p-8">
              <Eye className="w-6 h-6 brass-text mb-4" />
              <h3 className="font-display text-xl font-bold">Vision</h3>
              <p className="mt-3 text-sm muted-text leading-relaxed">
                A Nigeria where every public and enterprise system runs on secure, homegrown software infrastructure.
              </p>
            </div>
            <div className="bg-[var(--bg)] p-8">
              <Layers className="w-6 h-6 brass-text mb-4" />
              <h3 className="font-display text-xl font-bold">Approach</h3>
              <p className="mt-3 text-sm muted-text leading-relaxed">
                Bespoke, full-stack builds — never rigid pre-built templates — mapped to each client's real operating context.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Standards */}
      <section className="border-b rule py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-wide teal-text mb-4 font-semibold">What we hold to</p>
          <h2 className="font-display text-3xl sm:text-4xl max-w-xl font-bold">The standards behind every build</h2>

          <div className="mt-12 border-t rule-strong">
            <div className="ledger-row grid sm:grid-cols-12 gap-4 py-6 items-start">
              <span className="font-mono text-xs muted-text sm:col-span-2 pt-1 font-semibold">REF-ST</span>
              <h3 className="font-display text-lg sm:col-span-3 font-bold">Silicon-level security</h3>
              <p className="text-sm muted-text sm:col-span-7 leading-relaxed">
                Zero-trust environments and cryptographic verification on every proprietary document, identity action, and database stream we touch.
              </p>
            </div>
            <div className="ledger-row grid sm:grid-cols-12 gap-4 py-6 items-start">
              <span className="font-mono text-xs muted-text sm:col-span-2 pt-1 font-semibold">REF-AC</span>
              <h3 className="font-display text-lg sm:col-span-3 font-bold">Administrative fluency</h3>
              <p className="text-sm muted-text sm:col-span-7 leading-relaxed">
                We understand governance collections, document vaults, and citizen security frameworks — not just generic CRUD apps.
              </p>
            </div>
            <div className="ledger-row grid sm:grid-cols-12 gap-4 py-6 items-start">
              <span className="font-mono text-xs muted-text sm:col-span-2 pt-1 font-semibold">REF-CL</span>
              <h3 className="font-display text-lg sm:col-span-3 font-bold">Clean delivery</h3>
              <p className="text-sm muted-text sm:col-span-7 leading-relaxed">
                Predictable release cycles, transparent sprints, and codebases built to be handed over and maintained, not just shipped.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="border-b rule py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-wide teal-text mb-4 font-semibold">How we got here</p>
          <h2 className="font-display text-3xl sm:text-4xl max-w-xl font-bold">Milestones along the way</h2>

          <div className="mt-12 border-t rule-strong">
            <div className="ledger-row grid sm:grid-cols-12 gap-4 py-6 items-start">
              <span className="font-mono text-xs muted-text sm:col-span-2 pt-1 font-semibold">STAGE-01</span>
              <h3 className="font-display text-lg sm:col-span-3 font-bold">First offline-to-digital audit</h3>
              <p className="text-sm muted-text sm:col-span-7 leading-relaxed">
                Our earliest engagements mapped paper-based registers inside government offices, setting the template for every audit we run today.
              </p>
            </div>
            <div className="ledger-row grid sm:grid-cols-12 gap-4 py-6 items-start">
              <span className="font-mono text-xs muted-text sm:col-span-2 pt-1 font-semibold">STAGE-02</span>
              <h3 className="font-display text-lg sm:col-span-3 font-bold">First state revenue alliance</h3>
              <p className="text-sm muted-text sm:col-span-7 leading-relaxed">
                Our partnership with Ogun State OGIRS became the proving ground for the governance collections platform now behind Revenue Portal.
              </p>
            </div>
            <div className="ledger-row grid sm:grid-cols-12 gap-4 py-6 items-start">
              <span className="font-mono text-xs muted-text sm:col-span-2 pt-1 font-semibold">STAGE-03</span>
              <h3 className="font-display text-lg sm:col-span-3 font-bold">Zero-trust fleet rollout</h3>
              <p className="text-sm muted-text sm:col-span-7 leading-relaxed">
                Arqelion Access was generalized from a single client's identity system into a security layer standard across all institutional deployments.
              </p>
            </div>
            <div className="ledger-row grid sm:grid-cols-12 gap-4 py-6 items-start">
              <span className="font-mono text-xs muted-text sm:col-span-2 pt-1 font-semibold">STAGE-04</span>
              <h3 className="font-display text-lg sm:col-span-3 font-bold">24/7 operations hub established</h3>
              <p className="text-sm muted-text sm:col-span-7 leading-relaxed">
                Our Abuja hub coordinates a distributed engineering cohort holding 99.9% uptime across 11+ institutional alliances.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section className="border-b rule bg-surface py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <p className="font-mono text-xs uppercase tracking-wide teal-text mb-4 font-semibold">Compliance & standards</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold">Held to institutional standards, not startup shortcuts</h2>
            <p className="mt-4 text-sm muted-text leading-relaxed max-w-md">
              Because we build for revenue and identity systems, every platform is designed to satisfy the audit and compliance expectations of a government client from day one.
            </p>
          </div>
          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 brass-text shrink-0 mt-0.5" />
              <p className="text-sm muted-text leading-relaxed">Full audit trails on every record, action, and access request.</p>
            </div>
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 brass-text shrink-0 mt-0.5" />
              <p className="text-sm muted-text leading-relaxed">Cryptographic verification embedded at the data layer, not bolted on.</p>
            </div>
            <div className="flex items-start gap-3">
              <Server className="w-5 h-5 brass-text shrink-0 mt-0.5" />
              <p className="text-sm muted-text leading-relaxed">Air-gapped deployment capability for sovereign infrastructure.</p>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 brass-text shrink-0 mt-0.5" />
              <p className="text-sm muted-text leading-relaxed">Continuous vulnerability testing against adversarial posture models.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-display text-3xl font-bold">Meet the engineers behind the systems</h2>
          <p className="mt-3 text-sm muted-text">
            Explore our leadership team or review our active technology stack.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/team" className="btn-brass inline-flex items-center gap-2 px-6 py-3 rounded-sm font-semibold text-sm">
              <span>Meet the team</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href="/contact" className="btn-outline inline-flex items-center gap-2 px-6 py-3 rounded-sm font-medium text-sm">
              <span>Contact Abuja hub</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
