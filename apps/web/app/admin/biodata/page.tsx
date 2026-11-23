"use client"

import * as React from "react"
import Link from "next/link"
import {
  UserCheck,
  Clock,
  Search,
  Filter,
  Eye,
  Trash2,
  ExternalLink,
  Plus,
  RefreshCw,
  Building,
  CreditCard,
  Phone,
  Mail,
  Shield,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { useAdminAuth } from "@/hooks/use-admin-auth"

interface BioDataRecord {
  id: string
  first_name: string
  last_name: string
  other_name?: string
  email: string
  phone_number: string
  phone_number_2?: string
  marital_status?: string
  date_of_birth?: string
  gender?: string
  disability?: string
  passport?: string
  identification_nin?: string
  id_card_front?: string
  id_card_back?: string
  designation?: string
  company_email?: string
  department?: string
  idcard: boolean
  reference?: string
  workstation?: string
  state_of_origin?: string
  lga_of_origin?: string
  current_state?: string
  current_lga?: string
  current_address?: string
  country?: string
  staff_uid: string
  created_at: string
}

export default function AdminBioDataListPage() {
  const { canDelete, canUpdate } = useAdminAuth()
  const [items, setItems] = React.useState<BioDataRecord[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [departmentFilter, setDepartmentFilter] = React.useState("all")
  const [idCardFilter, setIdCardFilter] = React.useState("all")
  const [error, setError] = React.useState("")
  const [success, setSuccess] = React.useState("")
  const [updatingId, setUpdatingId] = React.useState<string | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      setError("")
      const res = await fetch("/api/admin/biodata")
      if (res.ok) {
        const data = await res.json()
        setItems(Array.isArray(data) ? data : [])
      } else {
        const d = await res.json()
        throw new Error(d.error || "Failed to load biodata records")
      }
    } catch (err: any) {
      setError(err.message || "Failed to load records")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadData()
  }, [])

  const handleToggleIdCard = async (id: string, currentStatus: boolean) => {
    if (!canUpdate) return
    try {
      setUpdatingId(id)
      const res = await fetch(`/api/admin/biodata/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idcard: !currentStatus }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "Failed to update ID card status")
      }
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, idcard: !currentStatus } : item
        )
      )
      setSuccess(`ID Card status updated for personnel.`)
      setTimeout(() => setSuccess(""), 4000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!canDelete) return
    if (
      !window.confirm(
        `Are you sure you want to delete the BioData record for ${name}? This action cannot be undone.`
      )
    ) {
      return
    }

    try {
      const res = await fetch(`/api/admin/biodata/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "Failed to delete record")
      }
      setItems((prev) => prev.filter((item) => item.id !== id))
      setSuccess(`BioData record for ${name} deleted successfully.`)
      setTimeout(() => setSuccess(""), 4000)
    } catch (err: any) {
      setError(err.message)
    }
  }

  // Derive unique departments
  const departments = React.useMemo(() => {
    const set = new Set<string>()
    items.forEach((item) => {
      if (item.department) set.add(item.department)
    })
    return Array.from(set).sort()
  }, [items])

  // Filter items
  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      const fullName = `${item.first_name} ${item.last_name} ${item.other_name || ""}`.toLowerCase()
      const q = search.toLowerCase().trim()
      const matchesSearch =
        !q ||
        fullName.includes(q) ||
        (item.staff_uid && item.staff_uid.toLowerCase().includes(q)) ||
        (item.email && item.email.toLowerCase().includes(q)) ||
        (item.company_email && item.company_email.toLowerCase().includes(q)) ||
        (item.phone_number && item.phone_number.includes(q)) ||
        (item.designation && item.designation.toLowerCase().includes(q)) ||
        (item.identification_nin && item.identification_nin.includes(q))

      const matchesDept =
        departmentFilter === "all" || item.department === departmentFilter

      const matchesIdCard =
        idCardFilter === "all" ||
        (idCardFilter === "issued" && item.idcard) ||
        (idCardFilter === "pending" && !item.idcard)

      return matchesSearch && matchesDept && matchesIdCard
    })
  }, [items, search, departmentFilter, idCardFilter])

  // Stats
  const totalCount = items.length
  const idCardsIssuedCount = items.filter((i) => i.idcard).length
  const pendingIdCards = totalCount - idCardsIssuedCount

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-[var(--ink)]">
            Personnel BioData Records
          </h1>
          <p className="mt-1 font-mono text-xs text-[var(--muted-custom)]">
            Enrolled personnel database, background verification, NIN identification, and ID cards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/attendance"
            className="flex items-center gap-1.5 rounded border rule bg-[var(--surface)] px-3 py-2 font-mono text-xs text-[var(--ink)] transition-colors hover:border-[var(--brass)]"
          >
            <Clock className="h-3.5 w-3.5 text-[var(--brass)]" />
            <span>Attendance Logs</span>
          </Link>

          <Link
            href="/public/bio-data/create-new"
            target="_blank"
            className="flex items-center gap-1.5 rounded border rule bg-[var(--surface)] px-3 py-2 font-mono text-xs text-[var(--ink)] transition-colors hover:border-[var(--brass)]"
          >
            <ExternalLink className="h-3.5 w-3.5 text-[var(--brass)]" />
            <span>Public Intake Form</span>
          </Link>

          <Link
            href="/admin/biodata/new"
            className="flex items-center gap-1.5 rounded bg-[var(--brass)] px-3.5 py-2 font-mono text-xs font-semibold text-black transition-opacity hover:opacity-90 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Enroll New Staff</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border rule bg-[var(--surface)] p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-[var(--muted-custom)] uppercase">
              Total Enrolled
            </span>
            <UserCheck className="h-4 w-4 text-[var(--brass)]" />
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-[var(--ink)]">
            {totalCount}
          </p>
        </div>

        <div className="rounded-lg border rule bg-[var(--surface)] p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-[var(--muted-custom)] uppercase">
              ID Cards Issued
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-emerald-500">
            {idCardsIssuedCount}
          </p>
        </div>

        <div className="rounded-lg border rule bg-[var(--surface)] p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-[var(--muted-custom)] uppercase">
              ID Cards Pending
            </span>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-amber-500">
            {pendingIdCards}
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

      {/* Search and Filter Controls */}
      <div className="flex flex-col gap-3 rounded-lg border rule bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--muted-custom)]" />
          <input
            type="text"
            placeholder="Search by name, Staff UID, email, NIN, designation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border rule bg-[var(--bg)] pl-9 pr-3 py-2 font-mono text-xs text-[var(--ink)] placeholder:text-[var(--muted-custom)] focus:border-[var(--brass)] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-md border rule bg-[var(--bg)] px-2.5 py-1.5">
            <Building className="h-3.5 w-3.5 text-[var(--muted-custom)]" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-transparent font-mono text-xs text-[var(--ink)] focus:outline-none cursor-pointer"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 rounded-md border rule bg-[var(--bg)] px-2.5 py-1.5">
            <CreditCard className="h-3.5 w-3.5 text-[var(--muted-custom)]" />
            <select
              value={idCardFilter}
              onChange={(e) => setIdCardFilter(e.target.value)}
              className="bg-transparent font-mono text-xs text-[var(--ink)] focus:outline-none cursor-pointer"
            >
              <option value="all">All ID Statuses</option>
              <option value="issued">Issued Only</option>
              <option value="pending">Pending Only</option>
            </select>
          </div>

          <button
            onClick={loadData}
            title="Refresh List"
            className="rounded-md border rule bg-[var(--bg)] p-2 text-[var(--muted-custom)] hover:text-[var(--ink)] hover:border-[var(--brass)] transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Records Table */}
      <div className="overflow-hidden rounded-lg border rule bg-[var(--surface)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="border-b rule bg-[var(--bg)] text-[var(--muted-custom)] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Personnel</th>
                <th className="px-4 py-3">Staff UID</th>
                <th className="px-4 py-3">Department & Role</th>
                <th className="px-4 py-3">Workstation</th>
                <th className="px-4 py-3">NIN</th>
                <th className="px-4 py-3 text-center">ID Card</th>
                <th className="px-4 py-3">Enrolled</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y rule text-[var(--ink)]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-[var(--muted-custom)]">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-[var(--brass)]" />
                      <span>Loading BioData records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-[var(--muted-custom)]">
                    {search || departmentFilter !== "all" || idCardFilter !== "all"
                      ? "No records matched your search filters."
                      : "No personnel biodata records enrolled yet."}
                  </td>
                </tr>
              ) : (
                filteredItems.map((rec) => {
                  const fullName = `${rec.first_name} ${rec.last_name} ${
                    rec.other_name ? rec.other_name : ""
                  }`.trim()

                  return (
                    <tr
                      key={rec.id}
                      className="transition-colors hover:bg-[var(--bg)]/50"
                    >
                      {/* Personnel */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {rec.passport ? (
                            <img
                              src={rec.passport}
                              alt={fullName}
                              className="h-10 w-10 shrink-0 rounded-full border rule object-cover bg-[var(--bg)]"
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border rule bg-[var(--brass)]/10 text-[var(--brass)] font-bold">
                              {rec.first_name?.[0]}
                              {rec.last_name?.[0]}
                            </div>
                          )}
                          <div className="min-w-0">
                            <Link
                              href={`/admin/biodata/${rec.id}`}
                              className="font-semibold text-[var(--ink)] hover:text-[var(--brass)] hover:underline truncate block"
                            >
                              {fullName}
                            </Link>
                            <div className="flex flex-col text-[11px] text-[var(--muted-custom)] truncate">
                              <span className="flex items-center gap-1">
                                <Mail className="h-2.5 w-2.5" />
                                {rec.company_email || rec.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="h-2.5 w-2.5" />
                                {rec.phone_number}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Staff UID */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-block rounded bg-[var(--brass)]/15 px-2 py-0.5 font-bold text-[var(--brass)] border border-[var(--brass)]/30">
                          {rec.staff_uid || "PENDING"}
                        </span>
                      </td>

                      {/* Department & Role */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[var(--ink)] truncate max-w-[160px]">
                          {rec.designation || "Staff Member"}
                        </div>
                        <div className="text-[11px] text-[var(--muted-custom)] truncate max-w-[160px]">
                          {rec.department || "General"}
                        </div>
                      </td>

                      {/* Workstation */}
                      <td className="px-4 py-3 whitespace-nowrap text-[var(--muted-custom)]">
                        {rec.workstation || "Headquarters"}
                      </td>

                      {/* NIN */}
                      <td className="px-4 py-3 whitespace-nowrap text-[var(--muted-custom)]">
                        {rec.identification_nin ? (
                          <span className="font-mono">{rec.identification_nin}</span>
                        ) : (
                          <span className="text-[var(--muted-custom)]/50 italic">None</span>
                        )}
                      </td>

                      {/* ID Card Status & Toggle */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleToggleIdCard(rec.id, rec.idcard)}
                          disabled={updatingId === rec.id || !canUpdate}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border transition-all ${
                            rec.idcard
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                              : "border-amber-500/30 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                          } ${updatingId === rec.id ? "opacity-50" : ""}`}
                          title="Click to toggle ID Card issuance status"
                        >
                          {rec.idcard ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Issued</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3" />
                              <span>Pending</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Enrolled Date */}
                      <td className="px-4 py-3 whitespace-nowrap text-[var(--muted-custom)]">
                        {rec.created_at
                          ? new Date(rec.created_at).toLocaleDateString()
                          : "—"}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/biodata/${rec.id}`}
                            className="rounded p-1.5 text-[var(--muted-custom)] hover:text-[var(--ink)] hover:bg-[var(--bg)]"
                            title="View Full Profile & ID Card"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>

                          {canDelete && (
                            <button
                              onClick={() => handleDelete(rec.id, fullName)}
                              className="rounded p-1.5 text-red-500/70 hover:text-red-500 hover:bg-red-500/10"
                              title="Delete Record"
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
    </div>
  )
}
