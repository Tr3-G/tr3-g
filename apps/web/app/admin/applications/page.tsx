"use client"

import * as React from "react"
import { FileText, Download, ExternalLink, Trash2, Filter, Eye, X, ClipboardList, User, Mail, Phone, Calendar, CheckCircle } from "lucide-react"
import { useAdminAuth } from "@/hooks/use-admin-auth"

export default function AdminApplicationsPage() {
  const { canUpdate, canDelete } = useAdminAuth()
  const [items, setItems] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [error, setError] = React.useState("")
  const [success, setSuccess] = React.useState("")
  const [selectedApp, setSelectedApp] = React.useState<any | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/applications")
      if (res.ok) {
        setItems(await res.json())
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadData()
  }, [])

  const handleStatusChange = async (id: string, newStatus: string) => {
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
      setItems((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status: newStatus } : item))
      )
      if (selectedApp && selectedApp._id === id) {
        setSelectedApp((prev: any) => ({ ...prev, status: newStatus }))
      }
      setSuccess("Application status updated.")
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDelete = async (id: string, applicant: string) => {
    if (!confirm(`Delete application from ${applicant}?`)) return
    try {
      const res = await fetch(`/api/admin/applications/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "Failed to delete")
      }
      setSuccess("Application deleted.")
      setItems((prev) => prev.filter((item) => item._id !== id))
      if (selectedApp && selectedApp._id === id) {
        setSelectedApp(null)
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  const filteredItems = items.filter((item) => {
    if (statusFilter === "all") return true
    return item.status === statusFilter
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b rule pb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide teal-text">RECRUITMENT INBOX</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Applications & Resumes</h1>
          <p className="mt-1 text-sm text-[var(--muted-custom)]">
            Review submissions, applicant cover notes, custom questionnaire answers, and download uploaded resumes.
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[var(--muted-custom)]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded border rule bg-[var(--surface)] px-3 py-1.5 font-mono text-xs text-[var(--ink)] outline-none focus:border-[var(--brass)]"
          >
            <option value="all">All Statuses ({items.length})</option>
            <option value="new">New</option>
            <option value="reviewing">Reviewing</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
            <option value="hired">Hired</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">{error}</div>
      )}
      {success && (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400">{success}</div>
      )}

      {/* Applications List */}
      <div className="rounded-lg border rule bg-[var(--surface)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b rule bg-[var(--surface-2)] font-mono text-xs text-[var(--muted-custom)] uppercase">
              <tr>
                <th className="px-6 py-3.5">Applicant Details</th>
                <th className="px-6 py-3.5">Role & Form Track</th>
                <th className="px-6 py-3.5">Contact Channels</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Received</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y rule">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center font-mono text-xs text-[var(--muted-custom)]">
                    Loading applications...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center font-mono text-xs text-[var(--muted-custom)]">
                    No applications match the current filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map((app) => (
                  <tr key={app._id} className="hover:bg-[var(--surface-2)]/50 transition-colors align-top">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[var(--ink)]">{app.full_name}</span>
                        {app.custom_answers && Object.keys(app.custom_answers).length > 0 && (
                          <span className="rounded bg-[var(--surface-2)] border rule px-1.5 py-0.5 font-mono text-[10px] text-[var(--brass)]" title="Contains custom form questionnaire responses">
                            +{Object.keys(app.custom_answers).length} answers
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-[var(--muted-custom)] max-w-md line-clamp-2 leading-relaxed">
                        {app.cover_note}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-3 font-mono text-xs">
                        {app.link && (
                          <a
                            href={app.link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 brass-text hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span>Portfolio / GitHub</span>
                          </a>
                        )}
                        {app.resume_id && (
                          <a
                            href={`/api/documents/${app.resume_id}`}
                            download={app.resume_name || "resume.pdf"}
                            className="inline-flex items-center gap-1 teal-text hover:underline"
                          >
                            <Download className="h-3 w-3" />
                            <span>CV ({app.resume_name || "Download"})</span>
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs font-semibold text-[var(--ink)]">
                        {app.career_title || "General Application"}
                      </div>
                      {app.form_title && (
                        <div className="mt-1">
                          <span className="inline-flex items-center gap-1 rounded bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 font-mono text-[10px] text-teal-400">
                            <ClipboardList className="h-2.5 w-2.5" />
                            {app.form_title}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-[var(--muted-custom)]">
                      <div>{app.email}</div>
                      <div className="mt-0.5">{app.phone || "No phone provided"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={app.status}
                        disabled={!canUpdate}
                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                        className="rounded border rule bg-[var(--bg)] px-2.5 py-1 font-mono text-xs text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                      >
                        <option value="new">new</option>
                        <option value="reviewing">reviewing</option>
                        <option value="shortlisted">shortlisted</option>
                        <option value="rejected">rejected</option>
                        <option value="hired">hired</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-[var(--muted-custom)]">
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="rounded border rule p-1.5 text-[var(--muted-custom)] hover:text-[var(--brass)] hover:border-[var(--brass)] transition-colors"
                          title="View full submission and answers"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(app._id, app.full_name)}
                            className="rounded border rule p-1.5 text-red-400 hover:border-red-500 hover:bg-red-500/10 transition-colors"
                            title="Delete application"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Application Inspection Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border rule-strong bg-[var(--surface)] p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b rule pb-4">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider teal-text">
                  Application Dossier
                </span>
                <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
                  {selectedApp.full_name}
                </h3>
                <p className="font-mono text-xs text-[var(--muted-custom)] mt-0.5">
                  Applied for: <span className="text-[var(--ink)] font-semibold">{selectedApp.career_title || "General Application"}</span>
                  {selectedApp.form_title && ` • Form: ${selectedApp.form_title}`}
                </p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="rounded p-1 text-[var(--muted-custom)] hover:text-[var(--ink)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {/* Applicant Metadata Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded border rule bg-[var(--surface-2)] p-3">
                  <span className="font-mono text-[10px] uppercase text-[var(--muted-custom)]">Email</span>
                  <div className="font-mono text-xs text-[var(--ink)] mt-0.5">{selectedApp.email}</div>
                </div>
                <div className="rounded border rule bg-[var(--surface-2)] p-3">
                  <span className="font-mono text-[10px] uppercase text-[var(--muted-custom)]">Phone</span>
                  <div className="font-mono text-xs text-[var(--ink)] mt-0.5">{selectedApp.phone || "Not provided"}</div>
                </div>
                <div className="rounded border rule bg-[var(--surface-2)] p-3">
                  <span className="font-mono text-[10px] uppercase text-[var(--muted-custom)]">Submitted</span>
                  <div className="font-mono text-xs text-[var(--ink)] mt-0.5">
                    {new Date(selectedApp.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="rounded border rule bg-[var(--surface-2)] p-3">
                  <span className="font-mono text-[10px] uppercase text-[var(--muted-custom)]">Status</span>
                  <div className="mt-1 flex items-center gap-2">
                    <select
                      value={selectedApp.status}
                      disabled={!canUpdate}
                      onChange={(e) => handleStatusChange(selectedApp._id, e.target.value)}
                      className="rounded border rule bg-[var(--bg)] px-2.5 py-1 font-mono text-xs text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                    >
                      <option value="new">new</option>
                      <option value="reviewing">reviewing</option>
                      <option value="shortlisted">shortlisted</option>
                      <option value="rejected">rejected</option>
                      <option value="hired">hired</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Links & Attachments */}
              <div className="flex flex-wrap gap-4 pt-1">
                {selectedApp.link && (
                  <a
                    href={selectedApp.link}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-outline inline-flex items-center gap-2 rounded px-3 py-1.5 font-mono text-xs text-[var(--brass)]"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>View Portfolio / GitHub</span>
                  </a>
                )}
                {selectedApp.resume_id && (
                  <a
                    href={`/api/documents/${selectedApp.resume_id}`}
                    download={selectedApp.resume_name || "resume.pdf"}
                    className="btn-outline inline-flex items-center gap-2 rounded px-3 py-1.5 font-mono text-xs text-teal-400"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download CV ({selectedApp.resume_name || "resume.pdf"})</span>
                  </a>
                )}
              </div>

              {/* Cover Note */}
              <div>
                <h4 className="font-mono text-xs uppercase tracking-wider text-[var(--muted-custom)] mb-2 font-semibold">
                  Cover Note / Pitch
                </h4>
                <div className="rounded border rule bg-[var(--bg)] p-4 text-sm text-[var(--ink)] leading-relaxed whitespace-pre-wrap">
                  {selectedApp.cover_note || "No cover note provided."}
                </div>
              </div>

              {/* Custom Questionnaire Answers */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardList className="h-4 w-4 text-[var(--brass)]" />
                  <h4 className="font-mono text-xs uppercase tracking-wider text-[var(--ink)] font-bold">
                    Custom Recruitment Form Responses
                  </h4>
                </div>

                {selectedApp.custom_answers && Object.keys(selectedApp.custom_answers).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(selectedApp.custom_answers).map(([key, val]) => (
                      <div key={key} className="rounded border rule bg-[var(--surface-2)] p-3.5">
                        <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--brass)] font-semibold">
                          {key.replace(/_/g, " ")}
                        </span>
                        <div className="mt-1 text-sm text-[var(--ink)] whitespace-pre-wrap">
                          {typeof val === "boolean"
                            ? val
                              ? "✓ Yes"
                              : "✗ No"
                            : String(val || "—")}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded border rule bg-[var(--bg)] p-4 text-center font-mono text-xs text-[var(--muted-custom)]">
                    No custom questionnaire responses recorded for this submission.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t rule pt-4">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="btn-outline rounded px-4 py-2 font-mono text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
