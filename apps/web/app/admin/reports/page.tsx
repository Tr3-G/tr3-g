"use client"

import * as React from "react"
import Link from "next/link"
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  Trash2,
  RefreshCw,
  Building,
  User,
  Mail,
  Calendar,
  AlertCircle,
  Paperclip,
  Check,
  X,
  MessageSquare,
  ShieldCheck,
  Send,
} from "lucide-react"
import { useAdminAuth } from "@/hooks/use-admin-auth"

interface StaffReport {
  id: string
  staff_uid: string
  staff_name: string
  workstation: string
  email: string
  title: string
  body: string
  file_url: string
  file_name?: string
  file_type?: string
  status: string
  approved_by?: string
  approved_by_id?: string
  approved_at?: string | null
  admin_notes?: string
  created_at: string
}

export default function AdminReportsPage() {
  const { user, canUpdate, canDelete } = useAdminAuth()
  const [reports, setReports] = React.useState<StaffReport[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [success, setSuccess] = React.useState("")
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")

  // Review Modal State
  const [activeReport, setActiveReport] = React.useState<StaffReport | null>(null)
  const [adminNotes, setAdminNotes] = React.useState("")
  const [approving, setApproving] = React.useState(false)

  const fetchReports = async () => {
    try {
      setLoading(true)
      setError("")
      const res = await fetch("/api/admin/reports")
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "Failed to load reports")
      }
      const data = await res.json()
      setReports(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err.message || "Failed to load reports")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchReports()
  }, [])

  const handleApprove = async (reportId: string, customNotes?: string) => {
    try {
      setApproving(true)
      setError("")

      const res = await fetch(`/api/admin/reports/${reportId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_notes: customNotes || adminNotes }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to approve report")
      }

      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? data.report : r))
      )

      if (activeReport && activeReport.id === reportId) {
        setActiveReport(data.report)
      }

      setSuccess(data.message || "Report approved and notification email dispatched via Brevo.")
      setTimeout(() => setSuccess(""), 5000)
    } catch (err: any) {
      setError(err.message || "Approval process failed.")
    } finally {
      setApproving(false)
    }
  }

  const handleDelete = async (reportId: string, reportTitle: string) => {
    if (!canDelete) return
    if (!window.confirm(`Delete report "${reportTitle}"? This cannot be undone.`)) return

    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "Failed to delete report")
      }
      setReports((prev) => prev.filter((r) => r.id !== reportId))
      if (activeReport?.id === reportId) {
        setActiveReport(null)
      }
      setSuccess("Report deleted successfully.")
      setTimeout(() => setSuccess(""), 4000)
    } catch (err: any) {
      setError(err.message)
    }
  }

  // Filtered reports
  const filteredReports = React.useMemo(() => {
    return reports.filter((r) => {
      const q = search.toLowerCase().trim()
      const matchesSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.staff_uid.toLowerCase().includes(q) ||
        r.staff_name.toLowerCase().includes(q) ||
        r.workstation.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q)

      const matchesStatus =
        statusFilter === "all" || r.status.toLowerCase() === statusFilter.toLowerCase()

      return matchesSearch && matchesStatus
    })
  }, [reports, search, statusFilter])

  // Stats
  const totalCount = reports.length
  const pendingCount = reports.filter((r) => r.status === "pending").length
  const approvedCount = reports.filter((r) => r.status === "approved").length

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-[var(--ink)]">
            Workforce Reports & Handover Logs
          </h1>
          <p className="mt-1 font-mono text-xs text-[var(--muted-custom)]">
            Review staff incident reports, shift handovers, and dispatch approval notifications.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/reports/submit"
            target="_blank"
            className="flex items-center gap-1.5 rounded border rule bg-[var(--surface)] px-3 py-2 font-mono text-xs text-[var(--ink)] transition-colors hover:border-[var(--brass)]"
          >
            <ExternalLink className="h-3.5 w-3.5 text-[var(--brass)]" />
            <span>Open Public Intake Portal</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border rule bg-[var(--surface)] p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase text-[var(--muted-custom)]">
              Total Reports
            </span>
            <FileText className="h-4 w-4 text-[var(--brass)]" />
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-[var(--ink)]">
            {totalCount}
          </p>
        </div>

        <div className="rounded-lg border rule bg-[var(--surface)] p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase text-[var(--muted-custom)]">
              Pending Review
            </span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-amber-500">
            {pendingCount}
          </p>
        </div>

        <div className="rounded-lg border rule bg-[var(--surface)] p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase text-[var(--muted-custom)]">
              Approved Reports
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-emerald-500">
            {approvedCount}
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 p-3 font-mono text-xs text-red-500">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 font-mono text-xs text-emerald-500">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col gap-3 rounded-lg border rule bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--muted-custom)]" />
          <input
            type="text"
            placeholder="Search by title, staff UID, author name, or workstation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border rule bg-[var(--bg)] pl-9 pr-3 py-2 font-mono text-xs text-[var(--ink)] placeholder:text-[var(--muted-custom)] focus:border-[var(--brass)] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-md border rule bg-[var(--bg)] px-2.5 py-1.5 font-mono text-xs">
            <Filter className="h-3.5 w-3.5 text-[var(--muted-custom)]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-[var(--ink)] focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Only</option>
              <option value="approved">Approved Only</option>
            </select>
          </div>

          <button
            onClick={fetchReports}
            title="Refresh reports"
            className="rounded-md border rule bg-[var(--bg)] p-2 text-[var(--muted-custom)] hover:text-[var(--ink)] hover:border-[var(--brass)] transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Reports Table */}
      <div className="overflow-hidden rounded-lg border rule bg-[var(--surface)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="border-b rule bg-[var(--bg)] text-[var(--muted-custom)] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Report Title</th>
                <th className="px-4 py-3">Staff UID / Author</th>
                <th className="px-4 py-3">Workstation</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Attachment</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3">Reviewed By</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y rule text-[var(--ink)]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-[var(--muted-custom)]">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-[var(--brass)]" />
                      <span>Loading reports...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-[var(--muted-custom)]">
                    No workforce reports found.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => {
                  const isApproved = report.status === "approved"
                  return (
                    <tr
                      key={report.id}
                      className="transition-colors hover:bg-[var(--bg)]/50"
                    >
                      {/* Title */}
                      <td className="px-4 py-3 max-w-xs">
                        <button
                          onClick={() => {
                            setActiveReport(report)
                            setAdminNotes(report.admin_notes || "")
                          }}
                          className="font-semibold text-[var(--ink)] hover:text-[var(--brass)] text-left truncate block max-w-xs"
                          title="Click to review full report"
                        >
                          {report.title}
                        </button>
                        <span className="text-[11px] text-[var(--muted-custom)] block truncate">
                          {report.body.slice(0, 60)}...
                        </span>
                      </td>

                      {/* Staff UID / Author */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="rounded bg-[var(--brass)]/15 px-2 py-0.5 font-bold text-[var(--brass)] border border-[var(--brass)]/30 block w-max">
                          {report.staff_uid}
                        </span>
                        <span className="text-[11px] text-[var(--muted-custom)] block mt-0.5 truncate max-w-[140px]">
                          {report.staff_name || report.email}
                        </span>
                      </td>

                      {/* Workstation */}
                      <td className="px-4 py-3 text-[var(--muted-custom)] truncate max-w-[140px]">
                        {report.workstation}
                      </td>

                      {/* Submitted */}
                      <td className="px-4 py-3 whitespace-nowrap text-[var(--muted-custom)]">
                        {new Date(report.created_at).toLocaleDateString()}
                      </td>

                      {/* Attachment */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {report.file_url ? (
                          <a
                            href={report.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[var(--brass)] hover:underline text-[11px]"
                          >
                            <Paperclip className="h-3 w-3" />
                            <span>File</span>
                          </a>
                        ) : (
                          <span className="text-[var(--muted-custom)]/50 italic">None</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-500">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Approved</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-500">
                            <Clock className="h-3 w-3" />
                            <span>Pending Review</span>
                          </span>
                        )}
                      </td>

                      {/* Reviewed By */}
                      <td className="px-4 py-3 whitespace-nowrap text-[var(--muted-custom)]">
                        {report.approved_by ? (
                          <span className="font-semibold text-emerald-500">
                            {report.approved_by}
                          </span>
                        ) : (
                          <span className="italic text-[var(--muted-custom)]/60">Awaiting</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isApproved && (
                            <button
                              onClick={() => handleApprove(report.id)}
                              disabled={approving}
                              className="rounded bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-semibold text-emerald-500 hover:bg-emerald-500/25 transition-colors flex items-center gap-1"
                              title="Quick Approve & Send Email"
                            >
                              <Check className="h-3 w-3" />
                              <span>Approve</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setActiveReport(report)
                              setAdminNotes(report.admin_notes || "")
                            }}
                            className="rounded p-1.5 text-[var(--muted-custom)] hover:text-[var(--ink)] hover:bg-[var(--bg)]"
                            title="Review Full Report"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {canDelete && (
                            <button
                              onClick={() => handleDelete(report.id, report.title)}
                              className="rounded p-1.5 text-red-500/70 hover:text-red-500 hover:bg-red-500/10"
                              title="Delete Report"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL REPORT REVIEW & APPROVAL MODAL */}
      {activeReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border-2 border-[var(--brass)]/40 bg-[var(--surface)] p-6 sm:p-8 shadow-2xl space-y-6 font-mono text-xs">
            {/* Close Button */}
            <button
              onClick={() => setActiveReport(null)}
              className="absolute right-4 top-4 rounded-lg p-2 text-[var(--muted-custom)] hover:text-[var(--ink)] hover:bg-[var(--bg)] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-2 text-[var(--brass)] uppercase font-bold tracking-wider">
              <ShieldCheck className="h-4 w-4" />
              <span>Official Report Review</span>
            </div>

            {/* Report Header Info */}
            <div className="space-y-3 rounded-xl border rule bg-[var(--bg)] p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b rule pb-3">
                <span className="rounded bg-[var(--brass)]/15 px-2.5 py-1 font-bold text-[var(--brass)] border border-[var(--brass)]/30">
                  {activeReport.staff_uid}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-[var(--muted-custom)]">Status:</span>
                  {activeReport.status === "approved" ? (
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-bold text-emerald-500">
                      APPROVED
                    </span>
                  ) : (
                    <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 font-bold text-amber-500">
                      PENDING REVIEW
                    </span>
                  )}
                </div>
              </div>

              <h2 className="font-heading text-lg font-bold text-[var(--ink)]">
                {activeReport.title}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[var(--muted-custom)] text-[11px]">
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-[var(--brass)]" />
                  <span>Author: <strong className="text-[var(--ink)]">{activeReport.staff_name || "Staff Member"}</strong></span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5 text-[var(--brass)]" />
                  <span>Workstation: <strong className="text-[var(--ink)]">{activeReport.workstation}</strong></span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-[var(--brass)]" />
                  <span>Email: <strong className="text-[var(--ink)]">{activeReport.email}</strong></span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-[var(--brass)]" />
                  <span>Date: <strong className="text-[var(--ink)]">{new Date(activeReport.created_at).toLocaleString()}</strong></span>
                </div>
              </div>
            </div>

            {/* Report Body */}
            <div className="space-y-2">
              <span className="font-bold uppercase text-[var(--muted-custom)] block">
                Report Description & Findings:
              </span>
              <div className="rounded-xl border rule bg-[var(--bg)] p-4 font-sans text-sm text-[var(--ink)] leading-relaxed whitespace-pre-wrap">
                {activeReport.body}
              </div>
            </div>

            {/* Attachment */}
            {activeReport.file_url && (
              <div className="space-y-2">
                <span className="font-bold uppercase text-[var(--muted-custom)] block">
                  Attached Document / File:
                </span>
                <div className="flex items-center justify-between rounded-lg border rule bg-[var(--bg)] p-3">
                  <div className="flex items-center gap-2 truncate">
                    <Paperclip className="h-4 w-4 text-[var(--brass)] shrink-0" />
                    <span className="truncate text-[var(--ink)] font-semibold">
                      {activeReport.file_name || "Attachment"}
                    </span>
                  </div>

                  <a
                    href={activeReport.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[var(--brass)] hover:underline shrink-0 font-bold"
                  >
                    <span>Download / View</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* Approval Info / Action Section */}
            {activeReport.status === "approved" ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 space-y-2">
                <div className="flex items-center gap-2 text-emerald-500 font-bold uppercase">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Report Formally Approved</span>
                </div>
                <p className="text-[var(--ink)]">
                  Approved by <strong>{activeReport.approved_by || "Administrator"}</strong> on{" "}
                  {activeReport.approved_at ? new Date(activeReport.approved_at).toLocaleString() : "Recently"}.
                </p>
                {activeReport.admin_notes && (
                  <p className="text-[var(--muted-custom)] italic">
                    Reviewer Notes: &ldquo;{activeReport.admin_notes}&rdquo;
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4 rounded-xl border border-[var(--brass)]/30 bg-[var(--brass)]/5 p-5">
                <div className="space-y-1">
                  <label className="block font-bold text-[var(--ink)] uppercase">
                    Admin Approval Notes (Optional):
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Add executive feedback or notes to be included in the approval notification email..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full rounded-lg border rule bg-[var(--bg)] p-2.5 text-[var(--ink)] focus:border-[var(--brass)] focus:outline-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <p className="text-[11px] text-[var(--muted-custom)]">
                    Clicking &ldquo;Approve Report&rdquo; will dispatch an automated email via Brevo to{" "}
                    <strong className="text-[var(--ink)]">{activeReport.email}</strong> stating that you (
                    <strong className="text-[var(--brass)]">
                      {(user as any)?.name || (user as any)?.username || "Admin"}
                    </strong>
                    ) have approved this report.
                  </p>

                  <button
                    onClick={() => handleApprove(activeReport.id, adminNotes)}
                    disabled={approving}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-mono text-xs font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    {approving ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Sending Email & Approving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Approve Report</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveReport(null)}
                className="rounded-lg border rule bg-[var(--bg)] px-5 py-2 font-semibold text-[var(--ink)] hover:border-[var(--brass)] transition-colors"
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
