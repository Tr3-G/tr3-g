"use client"

import * as React from "react"
import Link from "next/link"
import {
  Clock,
  ArrowLeft,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  LogIn,
  LogOut,
  Building,
  RefreshCw,
  Users,
  Briefcase,
  AlertCircle,
} from "lucide-react"

interface AttendanceRecord {
  id: string
  staff_id: string
  staff_uid: string
  staff_name: string
  designation: string
  department: string
  passport: string
  date: string
  check_in_time: string
  check_out_time: string | null
  duration_minutes: number
  status: string
  notes?: string
  workstation?: string
  created_at: string
}

export default function AttendanceLogsPublicPage() {
  const [logs, setLogs] = React.useState<AttendanceRecord[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [selectedDate, setSelectedDate] = React.useState("")
  const [search, setSearch] = React.useState("")
  const [departmentFilter, setDepartmentFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [stats, setStats] = React.useState({
    totalToday: 0,
    currentlyCheckedIn: 0,
    checkedOut: 0,
  })

  const fetchLogs = async (dateParam?: string) => {
    try {
      setLoading(true)
      setError("")

      const url = new URL("/api/attendance/logs", window.location.origin)
      if (dateParam) {
        url.searchParams.set("date", dateParam)
      }

      const res = await fetch(url.toString())
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "Failed to load attendance logs")
      }

      const data = await res.json()
      setLogs(Array.isArray(data.logs) ? data.logs : [])
      if (data.stats) {
        setStats(data.stats)
      }
      if (!selectedDate && data.today) {
        setSelectedDate(data.today)
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch attendance logs")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchLogs()
  }, [])

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate)
    fetchLogs(newDate)
  }

  // Derive unique departments
  const departments = React.useMemo(() => {
    const s = new Set<string>()
    logs.forEach((item) => {
      if (item.department) s.add(item.department)
    })
    return Array.from(s).sort()
  }, [logs])

  // Filter logs
  const filteredLogs = React.useMemo(() => {
    return logs.filter((item) => {
      const q = search.toLowerCase().trim()
      const matchesSearch =
        !q ||
        item.staff_name.toLowerCase().includes(q) ||
        item.staff_uid.toLowerCase().includes(q) ||
        item.designation.toLowerCase().includes(q)

      const matchesDept =
        departmentFilter === "all" || item.department === departmentFilter

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "checked_in" && !item.check_out_time) ||
        (statusFilter === "completed" && Boolean(item.check_out_time))

      return matchesSearch && matchesDept && matchesStatus
    })
  }, [logs, search, departmentFilter, statusFilter])

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 space-y-8">
      {/* Top Navigation & Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            href="/attendance"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-[var(--muted-custom)] hover:text-[var(--brass)] transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Clock-In Terminal</span>
          </Link>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-[var(--ink)]">
            Attendance Records & Logs
          </h1>
          <p className="font-mono text-xs text-[var(--muted-custom)]">
            Verified workplace arrival timestamps, active shifts, and departure logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/attendance"
            className="flex items-center gap-2 rounded-xl bg-[var(--brass)] px-4 py-2.5 font-mono text-xs font-semibold text-black transition-opacity hover:opacity-90 shadow"
          >
            <LogIn className="h-4 w-4" />
            <span>Clock In / Out</span>
          </Link>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border rule bg-[var(--surface)] p-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase text-[var(--muted-custom)]">
              Total Logged Today
            </span>
            <Users className="h-4 w-4 text-[var(--brass)]" />
          </div>
          <p className="mt-2 font-heading text-3xl font-bold text-[var(--ink)]">
            {stats.totalToday}
          </p>
        </div>

        <div className="rounded-xl border rule bg-[var(--surface)] p-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase text-[var(--muted-custom)]">
              Currently On-Site
            </span>
            <Clock className="h-4 w-4 text-blue-500" />
          </div>
          <p className="mt-2 font-heading text-3xl font-bold text-blue-500">
            {stats.currentlyCheckedIn}
          </p>
        </div>

        <div className="rounded-xl border rule bg-[var(--surface)] p-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase text-[var(--muted-custom)]">
              Shifts Completed
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 font-heading text-3xl font-bold text-emerald-500">
            {stats.checkedOut}
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3.5 font-mono text-xs text-red-500">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border rule bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--muted-custom)]" />
          <input
            type="text"
            placeholder="Search by staff name, Staff UID, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border rule bg-[var(--bg)] pl-9 pr-3 py-2 font-mono text-xs text-[var(--ink)] placeholder:text-[var(--muted-custom)] focus:border-[var(--brass)] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Picker */}
          <div className="flex items-center gap-1.5 rounded-lg border rule bg-[var(--bg)] px-2.5 py-1.5 font-mono text-xs">
            <Calendar className="h-3.5 w-3.5 text-[var(--brass)]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="bg-transparent text-[var(--ink)] focus:outline-none cursor-pointer"
            />
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-1.5 rounded-lg border rule bg-[var(--bg)] px-2.5 py-1.5 font-mono text-xs">
            <Building className="h-3.5 w-3.5 text-[var(--muted-custom)]" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-transparent text-[var(--ink)] focus:outline-none cursor-pointer"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 rounded-lg border rule bg-[var(--bg)] px-2.5 py-1.5 font-mono text-xs">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-[var(--ink)] focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="checked_in">Currently In</option>
              <option value="completed">Completed Shift</option>
            </select>
          </div>

          <button
            onClick={() => fetchLogs(selectedDate)}
            title="Refresh logs"
            className="rounded-lg border rule bg-[var(--bg)] p-2 text-[var(--muted-custom)] hover:text-[var(--ink)] hover:border-[var(--brass)] transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Attendance Logs Table */}
      <div className="overflow-hidden rounded-xl border rule bg-[var(--surface)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="border-b rule bg-[var(--bg)] text-[var(--muted-custom)] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Personnel</th>
                <th className="px-4 py-3.5">Staff UID</th>
                <th className="px-4 py-3.5">Role & Department</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Check-In</th>
                <th className="px-4 py-3.5">Check-Out</th>
                <th className="px-4 py-3.5">Duration</th>
                <th className="px-4 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y rule text-[var(--ink)]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-[var(--muted-custom)]">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-[var(--brass)]" />
                      <span>Loading attendance logs...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-[var(--muted-custom)]">
                    No attendance records logged for {selectedDate || "today"}.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const checkInFormatted = log.check_in_time
                    ? new Date(log.check_in_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : "—"

                  const checkOutFormatted = log.check_out_time
                    ? new Date(log.check_out_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : "—"

                  const hours = Math.floor((log.duration_minutes || 0) / 60)
                  const mins = (log.duration_minutes || 0) % 60
                  const durationStr = log.check_out_time
                    ? `${hours}h ${mins}m`
                    : "In progress"

                  return (
                    <tr
                      key={log.id}
                      className="transition-colors hover:bg-[var(--bg)]/50"
                    >
                      {/* Personnel */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          {log.passport ? (
                            <img
                              src={log.passport}
                              alt={log.staff_name}
                              className="h-9 w-9 shrink-0 rounded-full border rule object-cover bg-[var(--bg)]"
                            />
                          ) : (
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border rule bg-[var(--brass)]/15 font-bold text-[var(--brass)]">
                              {log.staff_name?.[0] || "S"}
                            </div>
                          )}
                          <div className="font-semibold text-[var(--ink)] truncate">
                            {log.staff_name}
                          </div>
                        </div>
                      </td>

                      {/* Staff UID */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="rounded bg-[var(--brass)]/15 px-2 py-0.5 font-bold text-[var(--brass)] border border-[var(--brass)]/30">
                          {log.staff_uid}
                        </span>
                      </td>

                      {/* Role & Department */}
                      <td className="px-4 py-3.5">
                        <div className="truncate max-w-[170px] font-medium text-[var(--ink)]">
                          {log.designation || "Staff"}
                        </div>
                        <div className="truncate max-w-[170px] text-[11px] text-[var(--muted-custom)]">
                          {log.department || "General"}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-[var(--muted-custom)]">
                        {log.date}
                      </td>

                      {/* Check-In */}
                      <td className="px-4 py-3.5 whitespace-nowrap font-semibold text-emerald-500">
                        {checkInFormatted}
                      </td>

                      {/* Check-Out */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-[var(--muted-custom)]">
                        {checkOutFormatted}
                      </td>

                      {/* Duration */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-[var(--muted-custom)]">
                        {durationStr}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        {log.check_out_time ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-500">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Completed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-blue-500">
                            <Clock className="h-3 w-3" />
                            <span>Checked In</span>
                          </span>
                        )}
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
