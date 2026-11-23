"use client"

import * as React from "react"
import Link from "next/link"
import {
  FileText,
  Filter,
  Eye,
  Trash2,
  ExternalLink,
  ChevronRight,
} from "lucide-react"
import { useAdminAuth } from "@/hooks/use-admin-auth"

export default function AdminApplicationsPage() {
  const { canUpdate, canDelete } = useAdminAuth()
  const [items, setItems] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [error, setError] = React.useState("")
  const [success, setSuccess] = React.useState("")

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/applications")
      if (res.ok) {
        setItems(await res.json())
      }
    } catch (err: any) {
      setError(err.message || "Failed to load applications")
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
    } catch (err: any) {
      setError(err.message)
    }
  }

  const filteredItems = items.filter((item) => {
    if (statusFilter === "all") return true
    return item.status === statusFilter
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "reviewing":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30"
      case "shortlisted":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "hired":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      default:
        return "bg-zinc-800 text-zinc-400 border-zinc-700"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b rule pb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide teal-text">RECRUITMENT INBOX</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Applications</h1>
          <p className="mt-1 text-sm text-[var(--muted-custom)]">
            Review incoming talent candidates, questionnaires, and submitted resumes.
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
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400">
          {success}
        </div>
      )}

      {/* Applications Table */}
      <div className="rounded-lg border rule bg-[var(--surface)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b rule bg-[var(--surface-2)] font-mono text-xs text-[var(--muted-custom)] uppercase">
              <tr>
                <th className="px-6 py-3.5">Name</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Received</th>
                <th className="px-6 py-3.5 text-right">Action</th>
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
                  <tr key={app._id} className="hover:bg-[var(--surface-2)]/50 transition-colors">
                    {/* 1. Name as link to ID page */}
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/applications/${app._id}`}
                        className="font-semibold text-[var(--ink)] hover:text-[var(--brass)] transition-colors inline-flex items-center gap-1 group"
                      >
                        <span>{app.full_name}</span>
                        <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--brass)]" />
                      </Link>
                    </td>

                    {/* 2. Role */}
                    <td className="px-6 py-4 font-mono text-xs text-[var(--ink)]">
                      {app.career_title || "General Application"}
                    </td>

                    {/* 3. Email */}
                    <td className="px-6 py-4 font-mono text-xs text-[var(--muted-custom)]">
                      <a href={`mailto:${app.email}`} className="hover:underline teal-text">
                        {app.email}
                      </a>
                    </td>

                    {/* 4. Status */}
                    <td className="px-6 py-4 font-mono text-xs">
                      {canUpdate ? (
                        <select
                          value={app.status || "new"}
                          onChange={(e) => handleStatusChange(app._id, e.target.value)}
                          className={`rounded border px-2 py-1 font-mono text-xs font-semibold uppercase outline-none ${getStatusBadge(
                            app.status || "new"
                          )}`}
                        >
                          <option value="new">New</option>
                          <option value="reviewing">Reviewing</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="rejected">Rejected</option>
                          <option value="hired">Hired</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-flex rounded border px-2 py-0.5 font-semibold uppercase ${getStatusBadge(
                            app.status || "new"
                          )}`}
                        >
                          {app.status || "new"}
                        </span>
                      )}
                    </td>

                    {/* 5. Received */}
                    <td className="px-6 py-4 font-mono text-xs text-[var(--muted-custom)] whitespace-nowrap">
                      {new Date(app.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* 6. Action */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/applications/${app._id}`}
                          className="rounded border rule px-2.5 py-1 font-mono text-xs text-[var(--ink)] hover:border-[var(--brass)] hover:text-[var(--brass)] inline-flex items-center gap-1"
                          title="View application details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View</span>
                        </Link>
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(app._id, app.full_name)}
                            className="rounded border rule p-1 text-red-400 hover:border-red-500 hover:bg-red-500/10"
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
    </div>
  )
}
