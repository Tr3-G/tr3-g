"use client"

import * as React from "react"
import Link from "next/link"
import {
  Clock,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  LogIn,
  LogOut,
  X,
  Search,
  Building,
  Briefcase,
  FileText,
  Calendar,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from "lucide-react"

interface StaffProfile {
  id: string
  staff_uid: string
  name: string
  first_name: string
  last_name: string
  designation: string
  department: string
  passport: string
  workstation: string
  email: string
}

interface TodayAttendance {
  id: string
  date: string
  check_in_time: string
  check_out_time: string | null
  duration_minutes: number
  status: string
  notes?: string
}

export default function AttendanceKioskPage() {
  const [inputUid, setInputUid] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [actionLoading, setActionLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [currentTime, setCurrentTime] = React.useState<Date | null>(null)

  // Modal State
  const [modalOpen, setModalOpen] = React.useState(false)
  const [staff, setStaff] = React.useState<StaffProfile | null>(null)
  const [attendance, setAttendance] = React.useState<TodayAttendance | null>(null)
  const [isCheckedIn, setIsCheckedIn] = React.useState(false)
  const [isCheckedOut, setIsCheckedOut] = React.useState(false)
  const [actionSuccess, setActionSuccess] = React.useState<string | null>(null)

  const inputRef = React.useRef<HTMLInputElement>(null)

  // Real-time clock update
  React.useEffect(() => {
    setCurrentTime(new Date())
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Auto-focus input on load
  React.useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setError("")
    setActionSuccess(null)

    const trimmed = inputUid.trim()
    if (!trimmed) {
      setError("Please enter your Staff ID or Staff UID.")
      inputRef.current?.focus()
      return
    }

    try {
      setLoading(true)
      const res = await fetch("/api/attendance/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staff_uid: trimmed }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Staff record not found.")
      }

      setStaff(data.staff)
      setAttendance(data.today_attendance)
      setIsCheckedIn(data.isCheckedIn)
      setIsCheckedOut(data.isCheckedOut)
      setModalOpen(true)
    } catch (err: any) {
      setError(err.message || "Failed to verify staff identity.")
    } finally {
      setLoading(false)
    }
  }

  const handleAttendanceAction = async (actionType: "check_in" | "check_out") => {
    if (!staff) return
    try {
      setActionLoading(true)
      setError("")

      const res = await fetch("/api/attendance/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staff_uid: staff.staff_uid,
          action: actionType,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || `Failed to process ${actionType}`)
      }

      setAttendance(data.attendance)
      if (actionType === "check_in") {
        setIsCheckedIn(true)
        setIsCheckedOut(false)
        setActionSuccess(data.message || "Check-in successfully recorded!")
      } else {
        setIsCheckedOut(true)
        setActionSuccess(data.message || "Check-out successfully recorded!")
      }

      // Auto close and reset after 3.5s
      setTimeout(() => {
        closeModal()
      }, 3500)
    } catch (err: any) {
      setError(err.message || "Action failed.")
    } finally {
      setActionLoading(false)
    }
  }

  const closeModal = () => {
    setModalOpen(false)
    setStaff(null)
    setAttendance(null)
    setIsCheckedIn(false)
    setIsCheckedOut(false)
    setActionSuccess(null)
    setError("")
    setInputUid("")
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  // Format time strings
  const formattedTime = currentTime
    ? currentTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    : "--:--:--"

  const formattedDate = currentTime
    ? currentTime.toLocaleDateString([], {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Loading date..."

  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 py-12">
      {/* Background Ambience */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center opacity-30">
        <div className="h-[500px] w-[500px] rounded-full bg-[var(--brass)]/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-xl space-y-6">
        {/* Terminal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--brass)]/30 bg-[var(--brass)]/10 px-3.5 py-1 font-mono text-xs font-semibold text-[var(--brass)]">
            <Clock className="h-3.5 w-3.5 animate-pulse" />
            <span>WORKFORCE ATTENDANCE TERMINAL</span>
          </div>

          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-[var(--ink)] sm:text-4xl">
            Staff Clock-In / Clock-Out
          </h1>
          <p className="font-mono text-xs text-[var(--muted-custom)] max-w-md mx-auto">
            Scan or enter your Staff ID to verify identity and record daily office attendance.
          </p>
        </div>

        {/* Live Digital Clock Card */}
        <div className="rounded-2xl border rule bg-[var(--surface)] p-6 text-center shadow-lg space-y-1">
          <div className="font-mono text-4xl sm:text-5xl font-extrabold tracking-wider text-[var(--brass)] font-variant-numeric">
            {formattedTime}
          </div>
          <div className="font-mono text-xs sm:text-sm text-[var(--muted-custom)] uppercase tracking-wider pt-1">
            {formattedDate} • West Africa Time (WAT)
          </div>
        </div>

        {/* Staff ID Input Form Card */}
        <div className="rounded-2xl border rule bg-[var(--surface)] p-6 sm:p-8 shadow-xl space-y-5">
          {error && !modalOpen && (
            <div className="flex items-center gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 p-3.5 font-mono text-xs text-red-500">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLookup} className="space-y-4">
            <div>
              <label
                htmlFor="staff-id-input"
                className="block font-mono text-xs font-semibold uppercase tracking-wider text-[var(--ink)] mb-2"
              >
                Staff Identification Number (Staff UID)
              </label>

              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-[var(--muted-custom)]" />
                <input
                  id="staff-id-input"
                  ref={inputRef}
                  type="text"
                  placeholder="e.g. TR3G-STF-A9B2C4 or Staff ID"
                  value={inputUid}
                  onChange={(e) => setInputUid(e.target.value.toUpperCase())}
                  disabled={loading}
                  autoComplete="off"
                  className="w-full rounded-xl border-2 rule bg-[var(--bg)] pl-11 pr-4 py-3 font-mono text-base font-bold tracking-wider text-[var(--ink)] placeholder:text-[var(--muted-custom)]/50 placeholder:font-normal focus:border-[var(--brass)] focus:outline-none transition-colors"
                />
              </div>

              <p className="mt-2 font-mono text-[11px] text-[var(--muted-custom)]">
                Input your assigned Staff UID, company email, or National ID. Press Enter to verify.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !inputUid.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--brass)] py-3.5 px-6 font-mono text-sm font-bold text-black transition-all hover:opacity-90 disabled:opacity-50 shadow-md cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Verifying Staff Credentials...</span>
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4" />
                  <span>Verify Identity & Proceed</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Links */}
          <div className="flex items-center justify-between border-t rule pt-4 font-mono text-xs">
            <Link
              href="/attendance/logs"
              className="text-[var(--muted-custom)] hover:text-[var(--brass)] transition-colors flex items-center gap-1"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>View Today's Attendance Logs</span>
            </Link>

            <Link
              href="/public/bio-data/create-new"
              className="text-[var(--muted-custom)] hover:text-[var(--ink)] transition-colors"
            >
              Need Staff Enrollment? →
            </Link>
          </div>
        </div>
      </div>

      {/* STAFF VERIFICATION & ACTION MODAL */}
      {modalOpen && staff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border-2 border-[var(--brass)]/40 bg-[var(--surface)] p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 rounded-lg p-2 text-[var(--muted-custom)] hover:text-[var(--ink)] hover:bg-[var(--bg)] transition-colors"
              title="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-2 font-mono text-xs text-[var(--brass)] uppercase font-semibold">
              <ShieldCheck className="h-4 w-4" />
              <span>Verified Personnel Profile</span>
            </div>

            {/* Staff Details Card (Name, Passport, Designation, Department) */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 rounded-xl border rule bg-[var(--bg)] p-5">
              {staff.passport ? (
                <img
                  src={staff.passport}
                  alt={staff.name}
                  className="h-24 w-24 shrink-0 rounded-xl border-2 border-[var(--brass)] object-cover shadow-md bg-[var(--surface)]"
                />
              ) : (
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border rule bg-[var(--brass)]/15 text-2xl font-bold text-[var(--brass)]">
                  {staff.first_name[0]}
                  {staff.last_name[0]}
                </div>
              )}

              <div className="space-y-1.5 text-center sm:text-left min-w-0 flex-1">
                <div className="inline-block rounded bg-[var(--brass)]/15 px-2 py-0.5 font-mono text-[11px] font-bold text-[var(--brass)] border border-[var(--brass)]/30">
                  {staff.staff_uid}
                </div>

                <h2 className="font-heading text-xl font-bold text-[var(--ink)] truncate">
                  {staff.name}
                </h2>

                <div className="font-mono text-xs text-[var(--ink)] font-semibold flex items-center justify-center sm:justify-start gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-[var(--brass)] shrink-0" />
                  <span className="truncate">{staff.designation}</span>
                </div>

                <div className="font-mono text-[11px] text-[var(--muted-custom)] flex items-center justify-center sm:justify-start gap-1.5">
                  <Building className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{staff.department} • {staff.workstation}</span>
                </div>
              </div>
            </div>

            {/* Alert / Notification Banner in Modal */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 font-mono text-xs text-red-500">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {actionSuccess && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/15 p-4 font-mono text-xs text-emerald-500 font-semibold animate-in zoom-in-95">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                <span>{actionSuccess}</span>
              </div>
            )}

            {/* Attendance Status & Trigger Button */}
            {!actionSuccess && (
              <div className="space-y-4">
                {/* STATE 1: NOT CHECKED IN */}
                {!isCheckedIn && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 font-mono text-xs text-amber-500 flex items-start gap-3">
                      <Clock className="h-4 w-4 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold uppercase">Status: Not Checked In Today</div>
                        <div className="text-[11px] text-amber-500/90 mt-0.5">
                          Ready to record arrival at {formattedTime}. Click the button below to confirm check-in.
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAttendanceAction("check_in")}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-4 px-6 font-mono text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                    >
                      {actionLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Recording Check-In...</span>
                        </>
                      ) : (
                        <>
                          <LogIn className="h-5 w-5" />
                          <span>CONFIRM CHECK-IN</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* STATE 2: CHECKED IN, READY FOR CHECKOUT */}
                {isCheckedIn && !isCheckedOut && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 font-mono text-xs text-blue-500 flex items-start gap-3">
                      <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold uppercase">Status: Currently Checked In</div>
                        <div className="text-[11px] text-blue-500/90 mt-0.5">
                          Arrival time:{" "}
                          <strong>
                            {attendance?.check_in_time
                              ? new Date(attendance.check_in_time).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                })
                              : "Earlier today"}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAttendanceAction("check_out")}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--brass)] py-4 px-6 font-mono text-sm font-bold text-black shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                    >
                      {actionLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Recording Check-Out...</span>
                        </>
                      ) : (
                        <>
                          <LogOut className="h-5 w-5" />
                          <span>CONFIRM CHECK-OUT</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* STATE 3: ALREADY CHECKED OUT */}
                {isCheckedIn && isCheckedOut && (
                  <div className="space-y-4 text-center">
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 font-mono text-xs text-emerald-500 space-y-2">
                      <CheckCircle2 className="h-8 w-8 mx-auto" />
                      <div className="font-bold text-sm uppercase">Shift Completed For Today</div>
                      <div className="text-[11px] text-[var(--ink)]">
                        In: {new Date(attendance?.check_in_time || "").toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}
                        {"  •  "}
                        Out: {new Date(attendance?.check_out_time || "").toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}
                      </div>
                      <div className="text-[11px] text-[var(--muted-custom)]">
                        Total duration: {Math.floor((attendance?.duration_minutes || 0) / 60)}h {(attendance?.duration_minutes || 0) % 60}m
                      </div>
                    </div>

                    <button
                      onClick={closeModal}
                      className="w-full rounded-xl border rule bg-[var(--bg)] py-3 px-6 font-mono text-xs font-semibold text-[var(--ink)] hover:border-[var(--brass)] transition-colors"
                    >
                      Close & Finish
                    </button>
                  </div>
                )}
              </div>
            )}

            {actionSuccess && (
              <div className="text-center pt-2">
                <button
                  onClick={closeModal}
                  className="rounded-lg border rule bg-[var(--bg)] px-6 py-2.5 font-mono text-xs font-semibold text-[var(--ink)] hover:border-[var(--brass)] transition-colors"
                >
                  Done (Closing in 3s)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
