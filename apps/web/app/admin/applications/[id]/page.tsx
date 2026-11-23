"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  FileText,
  Mail,
  Phone,
  ExternalLink,
  Download,
  Calendar,
  Briefcase,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ClipboardList,
  User,
} from "lucide-react"
import { useAdminAuth } from "@/hooks/use-admin-auth"

export default function ApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { canUpdate, canDelete } = useAdminAuth()
  const [app, setApp] = React.useState<any | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [success, setSuccess] = React.useState("")
  const [updatingStatus, setUpdatingStatus] = React.useState(false)

  const id = params?.id as string

  const loadData = async () => {
    if (!id) return
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/applications/${id}`)
      if (!res.ok) {
        throw new Error("Application not found")
      }
      setApp(await res.json())
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadData()
  }, [id])

  const handleStatusChange = async (newStatus: string) => {
    if (!id || !canUpdate) return
    setUpdatingStatus(true)
    setError("")
    setSuccess("")
    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "Failed to update status")
      }
      setApp((prev: any) => (prev ? { ...prev, status: newStatus } : prev))
      setSuccess(`Status updated to ${newStatus}.`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this application?")) return
    try {
      const res = await fetch(`/api/admin/applications/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "Failed to delete")
      }
      router.push("/admin/applications")
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="py-20 text-center font-mono text-xs text-[var(--muted-custom)]">
        Loading applicant details...
      </div>
    )
  }

  if (error || !app) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/applications"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-[var(--muted-custom)] hover:text-[var(--ink)]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Applications
        </Link>
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {error || "Application not found"}
        </div>
      </div>
    )
  }

  const resumeUrl =
    app.resume_id &&
    (app.resume_id.startsWith("http")
      ? app.resume_id
      : `/api/documents/${app.resume_id}`)

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/applications"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-[var(--muted-custom)] hover:text-[var(--ink)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Applications
        </Link>

        {canDelete && (
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 rounded border border-red-500/30 px-3 py-1.5 font-mono text-xs text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete Application
          </button>
        )}
      </div>

      {success && (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400">
          {success}
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-lg border rule-strong bg-[var(--surface)] p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-wider teal-text font-semibold">
                APPLICANT #{app._id?.slice(-6) || id.slice(-6)}
              </span>
              {app.form_title && (
                <span className="rounded bg-teal-500/10 border border-teal-500/30 px-2 py-0.5 font-mono text-[10px] text-teal-400">
                  {app.form_title}
                </span>
              )}
            </div>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-[var(--ink)]">
              {app.full_name}
            </h1>
            <p className="mt-1 text-base text-[var(--brass)] font-semibold">
              {app.career_title || "General Application"}
            </p>
          </div>

          {/* Status selector */}
          <div className="flex flex-col sm:items-end gap-2">
            <span className="font-mono text-xs text-[var(--muted-custom)] uppercase">
              Current Status
            </span>
            {canUpdate ? (
              <select
                value={app.status || "new"}
                disabled={updatingStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="rounded border rule-strong bg-[var(--surface-2)] px-4 py-2 font-mono text-xs font-semibold uppercase text-[var(--ink)] outline-none focus:border-[var(--brass)]"
              >
                <option value="new">New</option>
                <option value="reviewing">Reviewing</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="rejected">Rejected</option>
                <option value="hired">Hired</option>
              </select>
            ) : (
              <span className="rounded border px-3 py-1 font-mono text-xs font-semibold uppercase">
                {app.status}
              </span>
            )}
          </div>
        </div>

        {/* Contact Strip */}
        <div className="mt-6 pt-6 border-t rule grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-[var(--muted-custom)] shrink-0" />
            <a href={`mailto:${app.email}`} className="teal-text hover:underline truncate">
              {app.email}
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-[var(--muted-custom)] shrink-0" />
            <span className="text-[var(--ink)]">{app.phone || "No phone provided"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[var(--muted-custom)] shrink-0" />
            <span className="text-[var(--muted-custom)]">
              {new Date(app.created_at).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Cover note + Resume + Custom questions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Cover Note & Materials */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cover Note */}
          <div className="rounded-lg border rule bg-[var(--surface)] p-6">
            <h3 className="font-mono text-xs uppercase tracking-wide teal-text font-semibold mb-3">
              Cover Note & Statement
            </h3>
            <p className="text-sm leading-relaxed text-[var(--ink)] whitespace-pre-wrap">
              {app.cover_note}
            </p>
          </div>

          {/* Custom Questionnaire Answers */}
          {app.custom_answers && Object.keys(app.custom_answers).length > 0 && (
            <div className="rounded-lg border rule bg-[var(--surface)] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-mono text-xs uppercase tracking-wide teal-text font-semibold flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" /> Custom Form Responses
                </h3>
                <span className="font-mono text-xs text-[var(--muted-custom)]">
                  {Object.keys(app.custom_answers).length} questions answered
                </span>
              </div>

              <div className="space-y-4">
                {Object.entries(app.custom_answers).map(([key, val]: [string, any], idx) => (
                  <div key={idx} className="rounded border rule bg-[var(--surface-2)] p-4">
                    <p className="font-mono text-xs text-[var(--muted-custom)] uppercase">
                      Question #{idx + 1}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[var(--ink)]">{key}</p>
                    <div className="mt-2 text-sm text-[var(--ink)] leading-relaxed">
                      {typeof val === "boolean" ? (
                        val ? "Yes" : "No"
                      ) : Array.isArray(val) ? (
                        val.join(", ")
                      ) : (
                        String(val || "—")
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Submitted Documents & Links */}
        <div className="space-y-6">
          {/* Resume Box */}
          <div className="rounded-lg border rule bg-[var(--surface)] p-6">
            <h3 className="font-mono text-xs uppercase tracking-wide teal-text font-semibold mb-3">
              Submitted Resume
            </h3>

            {resumeUrl ? (
              <div className="space-y-3">
                <div className="rounded border rule bg-[var(--surface-2)] p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 brass-text shrink-0 mt-0.5" />
                    <div className="overflow-hidden">
                      <p className="text-sm font-semibold text-[var(--ink)] truncate">
                        {app.resume_name || "Applicant Resume"}
                      </p>
                      <p className="font-mono text-[11px] text-[var(--muted-custom)] mt-0.5">
                        {app.resume_mime || "Document"}
                      </p>
                    </div>
                  </div>
                </div>

                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  download={app.resume_name || "resume.pdf"}
                  className="btn-brass flex items-center justify-center gap-2 w-full rounded py-2 text-xs font-semibold"
                >
                  <Download className="h-4 w-4" />
                  <span>Download / View Resume</span>
                </a>
              </div>
            ) : (
              <p className="text-xs text-[var(--muted-custom)]">
                No resume file was attached to this submission.
              </p>
            )}
          </div>

          {/* Links / Portfolio */}
          {app.link && (
            <div className="rounded-lg border rule bg-[var(--surface)] p-6">
              <h3 className="font-mono text-xs uppercase tracking-wide teal-text font-semibold mb-3">
                Portfolio / Web Links
              </h3>
              <a
                href={app.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-xs brass-text hover:underline break-all"
              >
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                <span>{app.link}</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
