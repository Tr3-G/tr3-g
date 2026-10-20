"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowUpRight, GraduationCap, CheckCircle2, Upload, AlertCircle, Sparkles, FileText } from "lucide-react"

interface FormField {
  id: string
  label: string
  type: "text" | "textarea" | "email" | "tel" | "number" | "select" | "checkbox" | "file"
  placeholder?: string
  required: boolean
  options?: string[]
  helperText?: string
}

interface RecruitmentForm {
  _id?: string
  title: string
  code: string
  description: string
  category?: string
  career_ids?: string[]
  fields: FormField[]
  active: boolean
}

export default function CareersPage() {
  const [careers, setCareers] = React.useState<any[]>([])
  const [forms, setForms] = React.useState<RecruitmentForm[]>([])
  const [selectedFormId, setSelectedFormId] = React.useState<string>("")
  const [loading, setLoading] = React.useState(true)
  const [selectedRole, setSelectedRole] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [formStatus, setFormStatus] = React.useState<{ type: "success" | "error"; message: string } | null>(null)

  const [form, setForm] = React.useState({
    fullName: "",
    email: "",
    phone: "",
    link: "",
    coverNote: "",
  })
  const [customAnswers, setCustomAnswers] = React.useState<Record<string, any>>({})
  const [resumeFile, setResumeFile] = React.useState<File | null>(null)

  React.useEffect(() => {
    async function fetchData() {
      try {
        const [careersRes, formsRes] = await Promise.all([
          fetch("/api/public/content/career"),
          fetch("/api/public/forms"),
        ])

        if (careersRes.ok) {
          const careersData = await careersRes.json()
          setCareers(careersData)
          if (careersData.length > 0) {
            setSelectedRole(String(careersData[0]._id || careersData[0].id))
          }
        }

        if (formsRes.ok) {
          const formsData: RecruitmentForm[] = await formsRes.json()
          setForms(formsData)
          const firstForm = formsData[0]
          if (firstForm) {
            setSelectedFormId(String(firstForm._id || firstForm.code))
          }
        }
      } catch (err) {
        console.error("Failed to load careers data:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const currentForm = React.useMemo(() => {
    return forms.find((f) => String(f._id || f.code) === selectedFormId) || forms[0] || null
  }, [forms, selectedFormId])

  const handleRoleSelect = (careerId: string) => {
    setSelectedRole(careerId)
    // Attempt to match form with career if configured
    const matchedForm = forms.find(
      (f) => f.career_ids && f.career_ids.includes(careerId)
    )
    if (matchedForm) {
      setSelectedFormId(String(matchedForm._id || matchedForm.code))
    }
  }

  const handleCustomAnswerChange = (fieldId: string, value: any) => {
    setCustomAnswers((prev) => ({
      ...prev,
      [fieldId]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setFormStatus(null)

    try {
      const formData = new FormData()
      formData.append("fullName", form.fullName)
      formData.append("email", form.email)
      formData.append("phone", form.phone)
      formData.append("link", form.link)
      formData.append("careerId", selectedRole)
      formData.append("coverNote", form.coverNote)
      if (currentForm) {
        formData.append("formId", String(currentForm._id || currentForm.code))
        formData.append("formTitle", currentForm.title)
      }
      formData.append("customAnswers", JSON.stringify(customAnswers))

      if (resumeFile) {
        formData.append("resume", resumeFile)
      }

      const res = await fetch("/api/public/applications", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Application submission failed")
      }

      setFormStatus({
        type: "success",
        message: "Application submitted successfully! Our talent acquisition team will review your CV and custom questionnaire responses.",
      })

      setForm({ fullName: "", email: "", phone: "", link: "", coverNote: "" })
      setCustomAnswers({})
      setResumeFile(null)
    } catch (err: any) {
      setFormStatus({
        type: "error",
        message: err.message || "Unable to submit application.",
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
          <p className="font-mono text-xs uppercase tracking-wide brass-text mb-6">Talent & Culture</p>
          <h1 className="font-display text-4xl sm:text-5xl max-w-2xl leading-[1.1] font-bold">
            Build the systems that power national infrastructure
          </h1>
          <p className="mt-6 text-lg muted-text max-w-2xl leading-relaxed">
            We are looking for builders who take pride in writing robust, zero-leak software. We offer competitive compensation, engineering autonomy, and institutional impact.
          </p>
        </div>
      </section>

      {/* Careers Register */}
      <section className="border-b rule py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-10">
            <p className="font-mono text-xs uppercase tracking-wide teal-text mb-2">Open Positions</p>
            <h2 className="font-display text-3xl font-bold">Active recruitment register</h2>
          </div>

          <div className="border-t rule-strong">
            {loading ? (
              <div className="space-y-6 py-6">
                <div className="flex items-center justify-center py-2">
                  <div className="inline-flex items-center gap-2.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 font-mono text-xs teal-text shadow-sm">
                    <div className="h-2 w-2 rounded-full bg-teal-400 animate-ping" />
                    <span>Querying active recruitment register from database...</span>
                  </div>
                </div>

                <div className="divide-y rule">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="grid sm:grid-cols-12 gap-4 py-6 items-center">
                      <div className="sm:col-span-2">
                        <div className="h-4 w-16 rounded bg-[var(--surface-2)] animate-pulse" />
                      </div>
                      <div className="sm:col-span-4 space-y-2">
                        <div className="h-5 w-48 rounded bg-[var(--surface-2)] animate-pulse" />
                        <div className="h-3 w-64 rounded bg-[var(--surface-2)] animate-pulse" />
                      </div>
                      <div className="sm:col-span-4">
                        <div className="h-4 w-32 rounded bg-teal-500/20 animate-pulse" />
                      </div>
                      <div className="sm:col-span-2">
                        <div className="h-4 w-20 rounded bg-[var(--brass)]/20 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : careers.length === 0 ? (
              <div className="py-12 text-center font-mono text-xs muted-text">
                No active openings currently published. General applications are welcome below.
              </div>
            ) : (
              careers.map((career, idx) => (
                <div
                  key={career._id || idx}
                  className="ledger-row grid sm:grid-cols-12 gap-4 py-6 items-center"
                >
                  <span className="font-mono text-xs muted-text sm:col-span-2 font-semibold">
                    {career.meta?.code || `ROLE-${idx + 1}`}
                  </span>
                  <div className="sm:col-span-4">
                    <h3 className="font-display text-lg font-bold text-[var(--ink)]">{career.title}</h3>
                    <p className="text-xs muted-text mt-0.5 line-clamp-1">{career.description}</p>
                  </div>
                  <p className="text-sm muted-text sm:col-span-4 font-mono text-xs">
                    {career.meta?.location || career.body || "Abuja Operations Hub"}
                  </p>
                  <a
                    href="#apply"
                    onClick={() => handleRoleSelect(String(career._id || career.id))}
                    className="sm:col-span-2 text-sm brass-text hover:underline font-semibold"
                  >
                    Apply Now →
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <section id="apply" className="border-b rule bg-surface py-20">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="font-mono text-xs uppercase tracking-wide teal-text mb-2">Direct Channel</p>
            <h2 className="font-display text-3xl font-bold">Submit Your Application</h2>
            <p className="mt-2 text-sm muted-text">
              Select the appropriate recruitment track below. Your resume and questionnaire are securely ingested into our sovereign database.
            </p>
          </div>

          {/* Form / Track Selection Selector */}
          {loading ? (
            <div className="mb-8 rounded-lg border rule bg-[var(--surface-2)] p-4 space-y-3">
              <div className="h-4 w-48 rounded bg-[var(--brass)]/20 animate-pulse" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-3.5 rounded-md border rule bg-[var(--surface)] space-y-2">
                    <div className="h-4 w-40 rounded bg-[var(--surface-2)] animate-pulse" />
                    <div className="h-3 w-56 rounded bg-[var(--surface-2)] animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ) : forms.length > 0 && (
            <div className="mb-8 rounded-lg border rule bg-[var(--surface-2)] p-4">
              <label className="block font-mono text-xs uppercase tracking-wider text-[var(--brass)] mb-2 font-semibold">
                Recruitment Track & Application Form
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {forms.map((f) => {
                  const isSelected = String(f._id || f.code) === selectedFormId
                  return (
                    <button
                      key={f._id || f.code}
                      type="button"
                      onClick={() => {
                        setSelectedFormId(String(f._id || f.code))
                        setCustomAnswers({})
                      }}
                      className={`text-left p-3.5 rounded-md border transition-all ${
                        isSelected
                          ? "border-[var(--brass)] bg-[var(--surface)] shadow-md"
                          : "border-transparent bg-[var(--surface)]/50 hover:bg-[var(--surface)] text-[var(--muted-custom)]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[var(--ink)]">{f.title}</span>
                        <span className="font-mono text-[10px] text-[var(--brass)]">{f.code}</span>
                      </div>
                      <p className="mt-1 text-xs text-[var(--muted-custom)] line-clamp-2">
                        {f.description}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {formStatus && (
            <div
              className={`mb-8 rounded-md p-4 text-sm font-mono flex items-start gap-3 ${
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

          <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border rule-strong bg-[var(--bg)] p-8 shadow-xl">
            {currentForm && (
              <div className="border-b rule pb-4">
                <span className="font-mono text-xs uppercase tracking-wide teal-text">
                  Applying with: {currentForm.title} ({currentForm.code})
                </span>
                <p className="text-xs text-[var(--muted-custom)] mt-0.5">
                  {currentForm.description}
                </p>
              </div>
            )}

            {/* Standard Profile Fields */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block font-mono text-xs text-[var(--muted-custom)]">Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="e.g. Ibrahim Lawal"
                  className="mt-2 w-full rounded border rule bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-[var(--muted-custom)]">Email Address *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@domain.com"
                  className="mt-2 w-full rounded border rule bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block font-mono text-xs text-[var(--muted-custom)]">Phone Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+234 ..."
                  className="mt-2 w-full rounded border rule bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-[var(--muted-custom)]">Target Position *</label>
                <select
                  required
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="mt-2 w-full rounded border rule bg-[var(--surface)] px-3.5 py-2.5 font-mono text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                >
                  {careers.map((c) => (
                    <option key={c._id || c.id} value={String(c._id || c.id)}>
                      {c.title} ({c.meta?.code || "ROLE"})
                    </option>
                  ))}
                  <option value="general">General Engineering Inquiry</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs text-[var(--muted-custom)]">
                Portfolio / GitHub / LinkedIn URL
              </label>
              <input
                type="url"
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                placeholder="https://github.com/..."
                className="mt-2 w-full rounded border rule bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-[var(--muted-custom)]">
                Cover Note / Engineering Highlights *
              </label>
              <textarea
                required
                rows={4}
                value={form.coverNote}
                onChange={(e) => setForm({ ...form, coverNote: e.target.value })}
                placeholder="Briefly describe your systems background, distributed systems experience, or notable projects..."
                className="mt-2 w-full rounded border rule bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
              />
            </div>

            {/* Dynamic Form Custom Questions */}
            {currentForm && currentForm.fields && currentForm.fields.length > 0 && (
              <div className="space-y-5 rounded-md border rule bg-[var(--surface)] p-5">
                <div className="flex items-center gap-2 border-b rule pb-2">
                  <Sparkles className="h-4 w-4 text-[var(--brass)]" />
                  <h4 className="font-mono text-xs uppercase tracking-wider text-[var(--ink)] font-bold">
                    Additional Role-Specific Questions ({currentForm.title})
                  </h4>
                </div>

                {currentForm.fields.map((field) => {
                  const val = customAnswers[field.id] ?? ""

                  if (field.type === "textarea") {
                    return (
                      <div key={field.id}>
                        <label className="block font-mono text-xs text-[var(--ink)] font-semibold">
                          {field.label} {field.required && <span className="text-red-400">*</span>}
                        </label>
                        {field.helperText && (
                          <p className="text-[11px] text-[var(--muted-custom)] mt-0.5">{field.helperText}</p>
                        )}
                        <textarea
                          rows={3}
                          required={field.required}
                          value={val}
                          onChange={(e) => handleCustomAnswerChange(field.id, e.target.value)}
                          placeholder={field.placeholder || ""}
                          className="mt-2 w-full rounded border rule bg-[var(--bg)] px-3.5 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                        />
                      </div>
                    )
                  }

                  if (field.type === "select") {
                    return (
                      <div key={field.id}>
                        <label className="block font-mono text-xs text-[var(--ink)] font-semibold">
                          {field.label} {field.required && <span className="text-red-400">*</span>}
                        </label>
                        {field.helperText && (
                          <p className="text-[11px] text-[var(--muted-custom)] mt-0.5">{field.helperText}</p>
                        )}
                        <select
                          required={field.required}
                          value={val}
                          onChange={(e) => handleCustomAnswerChange(field.id, e.target.value)}
                          className="mt-2 w-full rounded border rule bg-[var(--bg)] px-3.5 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                        >
                          <option value="">-- Select an option --</option>
                          {field.options?.map((opt, oIdx) => (
                            <option key={oIdx} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    )
                  }

                  if (field.type === "checkbox") {
                    return (
                      <div key={field.id} className="flex items-start gap-3 pt-1">
                        <input
                          type="checkbox"
                          id={`custom-${field.id}`}
                          required={field.required}
                          checked={Boolean(val)}
                          onChange={(e) => handleCustomAnswerChange(field.id, e.target.checked)}
                          className="mt-1 h-4 w-4 rounded border rule accent-[var(--brass)]"
                        />
                        <div>
                          <label
                            htmlFor={`custom-${field.id}`}
                            className="font-mono text-xs text-[var(--ink)] font-semibold cursor-pointer"
                          >
                            {field.label} {field.required && <span className="text-red-400">*</span>}
                          </label>
                          {field.helperText && (
                            <p className="text-[11px] text-[var(--muted-custom)] mt-0.5">{field.helperText}</p>
                          )}
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div key={field.id}>
                      <label className="block font-mono text-xs text-[var(--ink)] font-semibold">
                        {field.label} {field.required && <span className="text-red-400">*</span>}
                      </label>
                      {field.helperText && (
                        <p className="text-[11px] text-[var(--muted-custom)] mt-0.5">{field.helperText}</p>
                      )}
                      <input
                        type={field.type === "number" ? "number" : field.type === "email" ? "email" : field.type === "tel" ? "tel" : "text"}
                        required={field.required}
                        value={val}
                        onChange={(e) => handleCustomAnswerChange(field.id, e.target.value)}
                        placeholder={field.placeholder || ""}
                        className="mt-2 w-full rounded border rule bg-[var(--bg)] px-3.5 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                      />
                    </div>
                  )
                })}
              </div>
            )}

            {/* Resume Upload (Stored as Bytes) */}
            <div>
              <label className="block font-mono text-xs text-[var(--muted-custom)]">
                Resume / CV File (.pdf, .docx, .doc — Stored as Bytes)
              </label>
              <div className="mt-2 flex items-center gap-4">
                <label className="btn-outline flex cursor-pointer items-center gap-2 rounded px-4 py-2.5 font-mono text-xs">
                  <Upload className="h-4 w-4" />
                  <span>{resumeFile ? resumeFile.name : "Choose CV File"}</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
                {resumeFile && (
                  <span className="font-mono text-xs text-[var(--muted-custom)]">
                    {(resumeFile.size / 1024).toFixed(1)} KB
                  </span>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-brass flex w-full items-center justify-center gap-2 rounded-sm py-3.5 text-sm font-semibold transition-all disabled:opacity-50"
            >
              {submitting ? (
                <span>Ingesting application...</span>
              ) : (
                <>
                  <span>Submit Application</span>
                  <ArrowUpRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
