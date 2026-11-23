"use client"

import * as React from "react"
import Link from "next/link"
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Building,
  Mail,
  User,
  ShieldCheck,
  Send,
  Sparkles,
  ArrowRight,
  FileCheck,
  Paperclip,
  X,
  RefreshCw,
} from "lucide-react"

export default function PublicReportSubmitPage() {
  const [staffUid, setStaffUid] = React.useState("")
  const [workstation, setWorkstation] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [title, setTitle] = React.useState("")
  const [body, setBody] = React.useState("")
  const [file, setFile] = React.useState<File | null>(null)
  const [filePreview, setFilePreview] = React.useState<string | null>(null)

  const [lookupLoading, setLookupLoading] = React.useState(false)
  const [staffInfo, setStaffInfo] = React.useState<{ name: string; designation?: string } | null>(null)

  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState("")
  const [successData, setSuccessData] = React.useState<{
    id: string
    title: string
    email: string
  } | null>(null)

  // Optional auto-lookup when staff completes entering Staff UID
  const handleStaffBlur = async () => {
    const trimmed = staffUid.trim()
    if (!trimmed || trimmed.length < 4) return

    try {
      setLookupLoading(true)
      const res = await fetch("/api/attendance/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staff_uid: trimmed }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.staff) {
          setStaffInfo({
            name: data.staff.name,
            designation: data.staff.designation,
          })
          if (!email && data.staff.email) {
            setEmail(data.staff.email)
          }
          if (!workstation && data.staff.workstation) {
            setWorkstation(data.staff.workstation)
          }
        }
      }
    } catch {
      // Ignore lookup failure; manual entry allowed
    } finally {
      setLookupLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null
    setFile(selected)
    if (selected) {
      if (selected.type.startsWith("image/")) {
        setFilePreview(URL.createObjectURL(selected))
      } else {
        setFilePreview(null)
      }
    } else {
      setFilePreview(null)
    }
  }

  const removeFile = () => {
    setFile(null)
    setFilePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!staffUid.trim() || !workstation.trim() || !email.trim() || !title.trim() || !body.trim()) {
      setError("Please fill out all required fields marked with *.")
      return
    }

    try {
      setSubmitting(true)
      const formData = new FormData()
      formData.append("staff_uid", staffUid.trim().toUpperCase())
      formData.append("workstation", workstation.trim())
      formData.append("email", email.trim().toLowerCase())
      formData.append("title", title.trim())
      formData.append("body", body.trim())
      if (file) {
        formData.append("file", file)
      }

      const res = await fetch("/api/public/reports", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit report.")
      }

      setSuccessData({
        id: data.report.id,
        title: data.report.title,
        email: data.report.email,
      })
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.")
    } finally {
      setSubmitting(false)
    }
  }

  if (successData) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-2xl border border-emerald-500/30 bg-[var(--surface)] p-8 text-center shadow-xl space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <div className="space-y-2">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--ink)]">
              Report Submitted Successfully
            </h1>
            <p className="font-mono text-xs text-[var(--muted-custom)] max-w-md mx-auto">
              Your report has been logged and queued for administrative review.
            </p>
          </div>

          <div className="rounded-xl border border-[var(--brass)]/30 bg-[var(--brass)]/10 p-5 font-mono text-left space-y-2 text-xs">
            <div className="flex justify-between border-b rule pb-2">
              <span className="text-[var(--muted-custom)] uppercase">Report Reference:</span>
              <span className="font-bold text-[var(--brass)]">{successData.id}</span>
            </div>
            <div className="flex justify-between border-b rule pb-2">
              <span className="text-[var(--muted-custom)] uppercase">Title:</span>
              <span className="font-semibold text-[var(--ink)]">{successData.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted-custom)] uppercase">Confirmation Dispatched To:</span>
              <span className="font-semibold text-emerald-500">{successData.email}</span>
            </div>
          </div>

          <div className="rounded-lg border rule bg-[var(--bg)] p-4 text-xs font-mono text-[var(--muted-custom)] text-left space-y-1.5">
            <p className="flex items-center gap-2 font-semibold text-[var(--ink)]">
              <Mail className="h-4 w-4 text-[var(--brass)]" />
              <span>Next Steps & Notification:</span>
            </p>
            <p>
              1. A receipt confirmation has been sent to your email address via Brevo.
            </p>
            <p>
              2. When an administrator reviews and approves your report, you will receive a second notification email containing the approving administrator&apos;s name.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 font-mono text-xs">
            <button
              onClick={() => {
                setSuccessData(null)
                setTitle("")
                setBody("")
                setFile(null)
                setFilePreview(null)
              }}
              className="w-full sm:w-auto rounded-xl bg-[var(--brass)] px-6 py-3 font-semibold text-black hover:opacity-90 transition-opacity"
            >
              Submit Another Report
            </button>
            <Link
              href="/"
              className="w-full sm:w-auto rounded-xl border rule bg-[var(--bg)] px-6 py-3 text-[var(--ink)] hover:border-[var(--brass)] transition-colors text-center"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center opacity-25">
        <div className="h-[550px] w-[550px] rounded-full bg-[var(--brass)]/10 blur-[130px]" />
      </div>

      <div className="mx-auto max-w-3xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--brass)]/30 bg-[var(--brass)]/10 px-3.5 py-1 font-mono text-xs font-semibold text-[var(--brass)]">
            <FileText className="h-3.5 w-3.5" />
            <span>TR3-G WORKFORCE REPORTING SYSTEM</span>
          </div>

          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-[var(--ink)] sm:text-4xl">
            Submit Operational / Staff Report
          </h1>
          <p className="font-mono text-xs text-[var(--muted-custom)] max-w-xl mx-auto">
            Official intake for daily shift handovers, operational logs, incident filings, and project progress reports.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 font-mono text-xs text-red-500">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Report Form */}
        <form onSubmit={handleSubmit} className="rounded-2xl border rule bg-[var(--surface)] p-6 sm:p-8 shadow-xl space-y-6">
          {/* Section 1: Staff & Workstation Credentials */}
          <div className="space-y-4 border-b rule pb-6">
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[var(--brass)]">
              <User className="h-4 w-4" />
              <span>1. Personnel & Workstation Identity</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
              {/* Staff ID */}
              <div>
                <label className="block text-[var(--ink)] font-semibold mb-1">
                  Staff ID / UID *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. TR3G-STF-A9B2C4"
                    value={staffUid}
                    onChange={(e) => setStaffUid(e.target.value.toUpperCase())}
                    onBlur={handleStaffBlur}
                    className="w-full rounded-lg border rule bg-[var(--bg)] px-3 py-2 text-[var(--ink)] focus:border-[var(--brass)] focus:outline-none tracking-wider font-bold"
                  />
                  {lookupLoading && (
                    <RefreshCw className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-[var(--brass)]" />
                  )}
                </div>
                {staffInfo && (
                  <p className="mt-1 text-[11px] text-emerald-500 font-medium">
                    ✓ Verified: {staffInfo.name} ({staffInfo.designation || "Staff"})
                  </p>
                )}
              </div>

              {/* Workstation */}
              <div>
                <label className="block text-[var(--ink)] font-semibold mb-1">
                  Workstation / Operating Location *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Abuja HQ / Site Terminal 1 / Remote"
                  value={workstation}
                  onChange={(e) => setWorkstation(e.target.value)}
                  className="w-full rounded-lg border rule bg-[var(--bg)] px-3 py-2 text-[var(--ink)] focus:border-[var(--brass)] focus:outline-none"
                />
              </div>

              {/* Official Email */}
              <div className="sm:col-span-2">
                <label className="block text-[var(--ink)] font-semibold mb-1">
                  Email Address (Receipt & Approval Notifications) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="staff@tr3-g.com.ng or your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border rule bg-[var(--bg)] px-3 py-2 text-[var(--ink)] focus:border-[var(--brass)] focus:outline-none"
                />
                <span className="block text-[11px] text-[var(--muted-custom)] mt-1">
                  All confirmation and administrative approval updates will be delivered to this email.
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Report Content */}
          <div className="space-y-4 border-b rule pb-6">
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[var(--brass)]">
              <FileText className="h-4 w-4" />
              <span>2. Report Documentation</span>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-[var(--ink)] font-semibold mb-1">
                  Report Title / Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daily Shift Handover — Engineering Infrastructure"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border rule bg-[var(--bg)] px-3 py-2.5 text-[var(--ink)] focus:border-[var(--brass)] focus:outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block text-[var(--ink)] font-semibold mb-1">
                  Report Body / Detailed Description *
                </label>
                <textarea
                  required
                  rows={8}
                  placeholder="Enter detailed report overview, key activities completed, blockers, telemetry metrics, or notes..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full rounded-lg border rule bg-[var(--bg)] p-3.5 text-[var(--ink)] focus:border-[var(--brass)] focus:outline-none font-sans text-sm leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Section 3: File Attachment */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[var(--brass)]">
              <Paperclip className="h-4 w-4" />
              <span>3. Supporting Documents & File Upload (Optional)</span>
            </div>

            <div className="rounded-xl border-2 border-dashed rule p-5 bg-[var(--bg)] font-mono text-xs space-y-3">
              {file ? (
                <div className="flex items-center justify-between rounded-lg border rule bg-[var(--surface)] p-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {filePreview ? (
                      <img
                        src={filePreview}
                        alt="Preview"
                        className="h-12 w-12 rounded object-cover border rule"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded bg-[var(--brass)]/15 text-[var(--brass)]">
                        <FileText className="h-6 w-6" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-[var(--ink)] truncate max-w-xs sm:max-w-md">
                        {file.name}
                      </p>
                      <p className="text-[11px] text-[var(--muted-custom)]">
                        {(file.size / 1024).toFixed(1)} KB • {file.type || "Document"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={removeFile}
                    className="rounded p-1.5 text-[var(--muted-custom)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    title="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center py-4 space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-[var(--muted-custom)]" />
                  <div>
                    <label
                      htmlFor="report-file-input"
                      className="cursor-pointer font-semibold text-[var(--brass)] hover:underline"
                    >
                      Click to choose an attachment
                    </label>
                    <span className="text-[var(--muted-custom)]"> or drag and drop</span>
                  </div>
                  <p className="text-[11px] text-[var(--muted-custom)]">
                    Supported: PDF, DOCX, XLSX, Images (PNG, JPG, WEBP), TXT, CSV up to 25MB
                  </p>
                  <input
                    id="report-file-input"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between border-t rule pt-6">
            <Link
              href="/"
              className="rounded-lg border rule bg-[var(--bg)] px-4 py-2.5 font-mono text-xs text-[var(--muted-custom)] hover:text-[var(--ink)] transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-[var(--brass)] px-6 py-3 font-mono text-xs font-bold text-black transition-opacity hover:opacity-90 disabled:opacity-50 shadow-md cursor-pointer"
            >
              {submitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Submitting & Dispatching Email...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Submit Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
