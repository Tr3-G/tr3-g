"use client"

import * as React from "react"
import { ArrowUpRight, Mail, Phone, MapPin, CheckCircle2, AlertCircle, Shield } from "lucide-react"

export default function ContactPage() {
  const [submitting, setSubmitting] = React.useState(false)
  const [formStatus, setFormStatus] = React.useState<{ type: "success" | "error"; message: string } | null>(null)

  const [form, setForm] = React.useState({
    name: "",
    organization: "",
    email: "",
    phone: "",
    topic: "Bespoke Enterprise Software",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setFormStatus(null)

    try {
      const res = await fetch("/api/public/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit message")
      }

      setFormStatus({
        type: "success",
        message: "Message received. Our engineering and engagement team will follow up via email/phone shortly.",
      })

      setForm({
        name: "",
        organization: "",
        email: "",
        phone: "",
        topic: "Bespoke Enterprise Software",
        message: "",
      })
    } catch (err: any) {
      setFormStatus({
        type: "error",
        message: err.message || "Failed to send message.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="border-b rule">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-16">
          <p className="font-mono text-xs uppercase tracking-wide brass-text mb-6">Contact channels</p>
          <h1 className="font-display text-4xl sm:text-5xl max-w-2xl leading-[1.1] font-bold">
            Initiate a project consultation or SLA engagement
          </h1>
          <p className="mt-6 text-lg muted-text max-w-2xl leading-relaxed">
            Reach out directly to our Abuja operations hub for architecture inquiries, state revenue alliances, or enterprise platform audits.
          </p>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="border-b rule py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-12 gap-12">
          {/* Info Details */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <p className="font-mono text-xs uppercase tracking-wide teal-text mb-2">Operations Center</p>
              <h2 className="font-display text-2xl font-bold">Abuja Headquarters</h2>
              <p className="mt-2 text-sm muted-text leading-relaxed">
                Centralized engineering, 24/7 server monitoring, and executive support hub.
              </p>
            </div>

            <div className="space-y-6 rounded-lg border rule bg-[var(--surface)] p-6">
              <div className="flex items-start gap-4">
                <MapPin className="h-5 w-5 brass-text shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-mono text-xs font-bold uppercase text-[var(--ink)]">Location</h4>
                  <p className="mt-1 text-sm text-[var(--muted-custom)] leading-relaxed">
                    AA2 Behind Arena Off Dunamis Church<br />
                    Kuje Abuja
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 border-t rule pt-5">
                <Mail className="h-5 w-5 brass-text shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-mono text-xs font-bold uppercase text-[var(--ink)]">Email Inquiries</h4>
                  <a
                    href="mailto:info@tr3-g.com.ng"
                    className="mt-1 block font-mono text-sm teal-text hover:underline"
                  >
                    info@tr3-g.com.ng
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 border-t rule pt-5">
                <Phone className="h-5 w-5 brass-text shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-mono text-xs font-bold uppercase text-[var(--ink)]">Direct Telephone</h4>
                  <a
                    href="tel:+23470488029218"
                    className="mt-1 block font-mono text-sm teal-text hover:underline"
                  >
                    +234 704 8802 9218
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 border-t rule pt-5">
                <Shield className="h-5 w-5 brass-text shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-mono text-xs font-bold uppercase text-[var(--ink)]">Support Protocol</h4>
                  <p className="mt-1 text-sm text-[var(--muted-custom)]">
                    24/7 Active SLA Escalation Desk
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7">
            <div className="rounded-lg border rule-strong bg-[var(--surface)] p-8 shadow-xl">
              <h2 className="font-display text-2xl font-bold">Send an Inquiry</h2>
              <p className="mt-1 text-sm text-[var(--muted-custom)]">
                Our engagement team responds within 24 hours of submission.
              </p>

              {formStatus && (
                <div
                  className={`mt-6 rounded-md p-4 text-sm font-mono flex items-start gap-3 ${
                    formStatus.type === "success"
                      ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : "border border-red-500/30 bg-red-500/10 text-red-400"
                  }`}
                >
                  {formStatus.type === "success" ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 shrink-0" />
                  )}
                  <span>{formStatus.message}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block font-mono text-xs text-[var(--muted-custom)]">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Engr. Aisha Bello"
                      className="mt-2 w-full rounded border rule bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-xs text-[var(--muted-custom)]">Organization / Ministry</label>
                    <input
                      type="text"
                      value={form.organization}
                      onChange={(e) => setForm({ ...form, organization: e.target.value })}
                      placeholder="e.g. State Revenue Service"
                      className="mt-2 w-full rounded border rule bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block font-mono text-xs text-[var(--muted-custom)]">Official Email *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="name@domain.gov.ng"
                      className="mt-2 w-full rounded border rule bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-xs text-[var(--muted-custom)]">Phone Number</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+234 ..."
                      className="mt-2 w-full rounded border rule bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-xs text-[var(--muted-custom)]">Topic of Engagement</label>
                  <select
                    value={form.topic}
                    onChange={(e) => setForm({ ...form, topic: e.target.value })}
                    className="mt-2 w-full rounded border rule bg-[var(--bg)] px-3.5 py-2.5 font-mono text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                  >
                    <option value="Bespoke Enterprise Software">Bespoke Enterprise Software</option>
                    <option value="State Revenue Collection Platform">State Revenue Collection Platform</option>
                    <option value="Zero-Trust Identity Integration">Zero-Trust Identity Integration</option>
                    <option value="Sovereign Infrastructure / Air-Gapped">Sovereign Infrastructure / Air-Gapped</option>
                    <option value="SLA Inquiry / Technical Support">SLA Inquiry / Technical Support</option>
                    <option value="Other Consultation">Other Consultation</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-xs text-[var(--muted-custom)]">Message / Scope Outline *</label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Details about your current infrastructure, transaction requirements, or institutional objectives..."
                    className="mt-2 w-full rounded border rule bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-brass flex w-full items-center justify-center gap-2 rounded-sm py-3.5 text-sm font-semibold transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <span>Transmitting message...</span>
                  ) : (
                    <>
                      <span>Transmit Message to Abuja Hub</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
