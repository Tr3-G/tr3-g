"use client"

import * as React from "react"
import Link from "next/link"
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Download,
  Trash2,
  Eye,
  Clock,
  User,
  Activity,
  Key,
  Check,
  X,
  Copy,
  Terminal,
  Shield,
  FileText,
  FileCheck,
} from "lucide-react"
import { useAdminAuth } from "@/hooks/use-admin-auth"

interface AuditLogEntry {
  id: string
  actor_id: string
  actor_name: string
  actor_role: string
  action: string
  resource: string
  resource_id?: string
  details: string
  ip_address?: string
  user_agent?: string
  status: string
  created_at: string
}

interface AuditStats {
  total: number
  logins: number
  approvals: number
  deletions: number
  todayCount: number
}

export default function AdminAuditLogsPage() {
  const { user } = useAdminAuth()
  const isSuperadmin = (user?.role as string) === "superadmin"

  const [logs, setLogs] = React.useState<AuditLogEntry[]>([])
  const [stats, setStats] = React.useState<AuditStats>({
    total: 0,
    logins: 0,
    approvals: 0,
    deletions: 0,
    todayCount: 0,
  })
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [success, setSuccess] = React.useState("")

  // Filters
  const [search, setSearch] = React.useState("")
  const [actionFilter, setActionFilter] = React.useState("all")
  const [resourceFilter, setResourceFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")

  // Modal
  const [selectedEntry, setSelectedEntry] = React.useState<AuditLogEntry | null>(null)
  const [copied, setCopied] = React.useState(false)

  const fetchAuditLogs = async () => {
    try {
      setLoading(true)
      setError("")

      const url = new URL("/api/admin/audit-logs", window.location.origin)
      if (actionFilter !== "all") url.searchParams.set("action", actionFilter)
      if (resourceFilter !== "all") url.searchParams.set("resource", resourceFilter)
      if (statusFilter !== "all") url.searchParams.set("status", statusFilter)
      if (search.trim()) url.searchParams.set("search", search.trim())

      const res = await fetch(url.toString())
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "Failed to load audit logs")
      }

      const data = await res.json()
      setLogs(Array.isArray(data.logs) ? data.logs : [])
      if (data.stats) setStats(data.stats)
    } catch (err: any) {
      setError(err.message || "Failed to fetch audit records.")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchAuditLogs()
  }, [actionFilter, resourceFilter, statusFilter])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchAuditLogs()
  }

  const handleClearLogs = async () => {
    if (!isSuperadmin) {
      alert("Only Superadministrators are authorized to clear system audit logs.")
      return
    }

    if (
      !window.confirm(
        "WARNING: Are you sure you want to purge all audit logs? This action is permanent and cannot be reversed."
      )
    ) {
      return
    }

    try {
      const res = await fetch("/api/admin/audit-logs", { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to clear audit logs")

      setSuccess("Audit logs cleared successfully.")
      setTimeout(() => setSuccess(""), 4000)
      fetchAuditLogs()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleExportCSV = () => {
    if (logs.length === 0) return

    const headers = [
      "ID",
      "Timestamp",
      "Actor Name",
      "Actor Role",
      "Action",
      "Resource",
      "Resource ID",
      "Status",
      "Details",
      "IP Address",
    ]

    const rows = logs.map((l) => [
      `"${l.id}"`,
      `"${new Date(l.created_at).toISOString()}"`,
      `"${l.actor_name}"`,
      `"${l.actor_role}"`,
      `"${l.action}"`,
      `"${l.resource}"`,
      `"${l.resource_id || ""}"`,
      `"${l.status}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${l.ip_address || ""}"`,
    ])

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `tr3g-audit-logs-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const copyLogId = (id: string) => {
    navigator.clipboard.writeText(id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getActionBadge = (action: string) => {
    const act = action.toUpperCase()
    if (act.includes("APPROVE") || act.includes("CREATE")) {
      return (
        <span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
          {act}
        </span>
      )
    }
    if (act.includes("DELETE") || act.includes("FAIL")) {
      return (
        <span className="rounded bg-red-500/15 border border-red-500/30 px-2 py-0.5 text-[10px] font-bold text-red-500">
          {act}
        </span>
      )
    }
    if (act.includes("LOGIN") || act.includes("UPDATE")) {
      return (
        <span className="rounded bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 text-[10px] font-bold text-blue-500">
          {act}
        </span>
      )
    }
    return (
      <span className="rounded bg-[var(--brass)]/15 border border-[var(--brass)]/30 px-2 py-0.5 text-[10px] font-bold text-[var(--brass)]">
        {act}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-[var(--ink)]">
            Enterprise Audit & Compliance Logs
          </h1>
          <p className="mt-1 font-mono text-xs text-[var(--muted-custom)]">
            Centralized security trail tracking system events, administrative logins, approvals, and mutations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={logs.length === 0}
            className="flex items-center gap-1.5 rounded border rule bg-[var(--surface)] px-3 py-2 font-mono text-xs text-[var(--ink)] hover:border-[var(--brass)] transition-colors disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5 text-[var(--brass)]" />
            <span>Export CSV</span>
          </button>

          {isSuperadmin && (
            <button
              onClick={handleClearLogs}
              className="flex items-center gap-1.5 rounded border border-red-500/30 bg-red-500/10 px-3 py-2 font-mono text-xs text-red-500 hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Purge Logs</span>
            </button>
          )}

          <button
            onClick={fetchAuditLogs}
            className="rounded border rule bg-[var(--surface)] p-2 text-[var(--muted-custom)] hover:text-[var(--ink)] hover:border-[var(--brass)] transition-colors"
            title="Refresh logs"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div className="rounded-lg border rule bg-[var(--surface)] p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase text-[var(--muted-custom)]">
              Total Events
            </span>
            <Activity className="h-4 w-4 text-[var(--brass)]" />
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-[var(--ink)]">
            {stats.total}
          </p>
        </div>

        <div className="rounded-lg border rule bg-[var(--surface)] p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase text-[var(--muted-custom)]">
              24h Activity
            </span>
            <Clock className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-emerald-500">
            {stats.todayCount}
          </p>
        </div>

        <div className="rounded-lg border rule bg-[var(--surface)] p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase text-[var(--muted-custom)]">
              Admin Logins
            </span>
            <Key className="h-4 w-4 text-blue-500" />
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-blue-500">
            {stats.logins}
          </p>
        </div>

        <div className="rounded-lg border rule bg-[var(--surface)] p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase text-[var(--muted-custom)]">
              Approvals
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-emerald-500">
            {stats.approvals}
          </p>
        </div>

        <div className="rounded-lg border rule bg-[var(--surface)] p-4 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase text-[var(--muted-custom)]">
              Deletions
            </span>
            <Trash2 className="h-4 w-4 text-red-500" />
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-red-500">
            {stats.deletions}
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 p-3 font-mono text-xs text-red-500">
          <XCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 font-mono text-xs text-emerald-500">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Search and Filters Toolbar */}
      <div className="flex flex-col gap-3 rounded-lg border rule bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--muted-custom)]" />
          <input
            type="text"
            placeholder="Search by actor, action, resource, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border rule bg-[var(--bg)] pl-9 pr-3 py-2 font-mono text-xs text-[var(--ink)] placeholder:text-[var(--muted-custom)] focus:border-[var(--brass)] focus:outline-none"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Action Filter */}
          <div className="flex items-center gap-1.5 rounded-md border rule bg-[var(--bg)] px-2.5 py-1.5 font-mono text-xs">
            <span className="text-[var(--muted-custom)]">Action:</span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-transparent text-[var(--ink)] focus:outline-none cursor-pointer"
            >
              <option value="all">All Actions</option>
              <option value="LOGIN">LOGIN</option>
              <option value="APPROVE">APPROVE</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="DISPATCH">DISPATCH</option>
            </select>
          </div>

          {/* Resource Filter */}
          <div className="flex items-center gap-1.5 rounded-md border rule bg-[var(--bg)] px-2.5 py-1.5 font-mono text-xs">
            <span className="text-[var(--muted-custom)]">Resource:</span>
            <select
              value={resourceFilter}
              onChange={(e) => setResourceFilter(e.target.value)}
              className="bg-transparent text-[var(--ink)] focus:outline-none cursor-pointer"
            >
              <option value="all">All Resources</option>
              <option value="auth">auth</option>
              <option value="reports">reports</option>
              <option value="biodata">biodata</option>
              <option value="attendance">attendance</option>
              <option value="applications">applications</option>
              <option value="gallery">gallery</option>
              <option value="staff">staff</option>
              <option value="email">email</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 rounded-md border rule bg-[var(--bg)] px-2.5 py-1.5 font-mono text-xs">
            <span className="text-[var(--muted-custom)]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-[var(--ink)] focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="failure">Failure</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-hidden rounded-lg border rule bg-[var(--surface)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="border-b rule bg-[var(--bg)] text-[var(--muted-custom)] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Timestamp (WAT)</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Resource</th>
                <th className="px-4 py-3">Event Summary</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y rule text-[var(--ink)]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-[var(--muted-custom)]">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-[var(--brass)]" />
                      <span>Loading audit trail records...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-[var(--muted-custom)]">
                    No audit records matched your filter criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedEntry(log)}
                      className="transition-colors hover:bg-[var(--bg)]/50 cursor-pointer"
                    >
                      {/* Timestamp */}
                      <td className="px-4 py-3 whitespace-nowrap text-[var(--muted-custom)] text-[11px]">
                        {new Date(log.created_at).toLocaleString([], {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: true,
                        })}
                      </td>

                      {/* Actor */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--brass)]/15 text-[var(--brass)] text-[10px] font-bold">
                            {log.actor_name?.[0]?.toUpperCase() || "A"}
                          </div>
                          <div>
                            <span className="font-semibold text-[var(--ink)] block">
                              {log.actor_name}
                            </span>
                            <span className="text-[10px] text-[var(--muted-custom)] uppercase">
                              {log.actor_role}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {getActionBadge(log.action)}
                      </td>

                      {/* Resource */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="rounded bg-[var(--bg)] border rule px-2 py-0.5 font-bold uppercase text-[10px] text-[var(--ink)]">
                          {log.resource}
                        </span>
                      </td>

                      {/* Details */}
                      <td className="px-4 py-3 max-w-md">
                        <span className="truncate block max-w-sm sm:max-w-md text-[var(--ink)] font-sans text-xs">
                          {log.details}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {log.status === "success" ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>OK</span>
                          </span>
                        ) : log.status === "warning" ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-500">
                            <AlertTriangle className="h-3 w-3" />
                            <span>WARN</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-500">
                            <XCircle className="h-3 w-3" />
                            <span>FAIL</span>
                          </span>
                        )}
                      </td>

                      {/* Inspect */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedEntry(log)
                          }}
                          className="rounded p-1.5 text-[var(--muted-custom)] hover:text-[var(--ink)] hover:bg-[var(--bg)]"
                          title="Inspect audit payload"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AUDIT LOG INSPECTION MODAL */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-2xl border-2 border-[var(--brass)]/40 bg-[var(--surface)] p-6 shadow-2xl space-y-5 font-mono text-xs">
            {/* Close Button */}
            <button
              onClick={() => setSelectedEntry(null)}
              className="absolute right-4 top-4 rounded-lg p-2 text-[var(--muted-custom)] hover:text-[var(--ink)] hover:bg-[var(--bg)] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-2 text-[var(--brass)] uppercase font-bold tracking-wider">
              <Terminal className="h-4 w-4" />
              <span>Audit Log Record Inspector</span>
            </div>

            {/* Event Summary Card */}
            <div className="rounded-xl border rule bg-[var(--bg)] p-4 space-y-2">
              <div className="flex items-center justify-between border-b rule pb-2">
                <span className="text-[var(--muted-custom)]">EVENT ID:</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[var(--brass)] font-bold">{selectedEntry.id}</span>
                  <button
                    onClick={() => copyLogId(selectedEntry.id)}
                    className="p-1 hover:text-[var(--ink)] transition-colors"
                    title="Copy ID"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span className="text-[var(--muted-custom)] block">ACTOR:</span>
                  <span className="font-semibold text-[var(--ink)]">
                    {selectedEntry.actor_name} ({selectedEntry.actor_role})
                  </span>
                </div>

                <div>
                  <span className="text-[var(--muted-custom)] block">ACTION:</span>
                  <span className="font-bold text-[var(--brass)]">{selectedEntry.action}</span>
                </div>

                <div>
                  <span className="text-[var(--muted-custom)] block">RESOURCE:</span>
                  <span className="font-semibold text-[var(--ink)]">
                    {selectedEntry.resource} {selectedEntry.resource_id ? `(${selectedEntry.resource_id})` : ""}
                  </span>
                </div>

                <div>
                  <span className="text-[var(--muted-custom)] block">STATUS:</span>
                  <span className="font-semibold uppercase text-emerald-500">
                    {selectedEntry.status}
                  </span>
                </div>

                <div className="col-span-2">
                  <span className="text-[var(--muted-custom)] block">TIMESTAMP:</span>
                  <span className="text-[var(--ink)]">
                    {new Date(selectedEntry.created_at).toLocaleString()} (
                    {selectedEntry.created_at})
                  </span>
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="space-y-1.5">
              <span className="text-[var(--muted-custom)] uppercase font-bold block">
                Details:
              </span>
              <div className="rounded-lg border rule bg-[var(--bg)] p-3.5 text-[var(--ink)] leading-relaxed whitespace-pre-wrap font-sans text-xs">
                {selectedEntry.details}
              </div>
            </div>

            {/* Client Telemetry */}
            <div className="rounded-lg border rule bg-[var(--bg)] p-3 text-[11px] space-y-1 text-[var(--muted-custom)]">
              <div>
                IP ADDRESS: <strong className="text-[var(--ink)]">{selectedEntry.ip_address || "Internal / Localhost"}</strong>
              </div>
              <div className="truncate">
                USER AGENT: <span className="text-[var(--ink)]">{selectedEntry.user_agent || "Automated Server Action"}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] text-emerald-500">
                {copied ? "✓ Event ID copied to clipboard" : ""}
              </span>

              <button
                onClick={() => setSelectedEntry(null)}
                className="rounded-lg border rule bg-[var(--bg)] px-5 py-2 font-semibold text-[var(--ink)] hover:border-[var(--brass)] transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
