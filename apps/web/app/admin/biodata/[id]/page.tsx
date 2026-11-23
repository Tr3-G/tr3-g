"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  User,
  Shield,
  CreditCard,
  MapPin,
  Building,
  Briefcase,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Printer,
  Copy,
  ExternalLink,
  Users,
  FileText,
  Trash2,
} from "lucide-react"
import { useAdminAuth } from "@/hooks/use-admin-auth"

interface Guarantor {
  full_name: string
  email: string
  phone: string
  passport?: string
  address: string
}

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
  guarantor_1?: Guarantor
  guarantor_2?: Guarantor
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

export default function AdminBioDataDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const { canDelete, canUpdate } = useAdminAuth()

  const [record, setRecord] = React.useState<BioDataRecord | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [success, setSuccess] = React.useState("")
  const [copied, setCopied] = React.useState(false)
  const [updatingIdCard, setUpdatingIdCard] = React.useState(false)

  const loadRecord = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/biodata/${id}`)
      if (res.ok) {
        const data = await res.json()
        setRecord(data)
      } else {
        const d = await res.json()
        throw new Error(d.error || "Failed to load record")
      }
    } catch (err: any) {
      setError(err.message || "Failed to load biodata record")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    if (id) {
      loadRecord()
    }
  }, [id])

  const copyUid = () => {
    if (record?.staff_uid) {
      navigator.clipboard.writeText(record.staff_uid)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleToggleIdCard = async () => {
    if (!record || !canUpdate) return
    try {
      setUpdatingIdCard(true)
      const newStatus = !record.idcard
      const res = await fetch(`/api/admin/biodata/${record.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idcard: newStatus }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "Failed to update ID card status")
      }
      setRecord({ ...record, idcard: newStatus })
      setSuccess(`ID Card status updated to ${newStatus ? "Issued" : "Pending"}`)
      setTimeout(() => setSuccess(""), 4000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUpdatingIdCard(false)
    }
  }

  const handleDelete = async () => {
    if (!record || !canDelete) return
    const fullName = `${record.first_name} ${record.last_name}`
    if (
      !window.confirm(
        `Are you sure you want to permanently delete the BioData record for ${fullName}?`
      )
    ) {
      return
    }

    try {
      const res = await fetch(`/api/admin/biodata/${record.id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "Failed to delete record")
      }
      router.push("/admin/biodata")
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center font-mono text-xs text-[var(--muted-custom)]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--brass)] border-t-transparent" />
          <span>Retrieving personnel record...</span>
        </div>
      </div>
    )
  }

  if (error && !record) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/biodata"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-[var(--muted-custom)] hover:text-[var(--ink)]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Records</span>
        </Link>
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 font-mono text-xs text-red-500">
          {error}
        </div>
      </div>
    )
  }

  if (!record) return null

  const fullName = `${record.first_name} ${record.last_name} ${
    record.other_name ? record.other_name : ""
  }`.trim()

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/biodata"
            className="rounded border rule bg-[var(--surface)] p-2 text-[var(--muted-custom)] hover:text-[var(--ink)] hover:border-[var(--brass)] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-xl font-bold text-[var(--ink)]">
                {fullName}
              </h1>
              <span className="rounded bg-[var(--brass)]/15 px-2 py-0.5 font-mono text-xs font-bold text-[var(--brass)] border border-[var(--brass)]/30">
                {record.staff_uid}
              </span>
            </div>
            <p className="font-mono text-xs text-[var(--muted-custom)]">
              Enrolled on {new Date(record.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={copyUid}
            className="flex items-center gap-1.5 rounded border rule bg-[var(--surface)] px-3 py-1.5 font-mono text-xs text-[var(--ink)] hover:border-[var(--brass)] transition-colors"
          >
            <Copy className="h-3.5 w-3.5 text-[var(--brass)]" />
            <span>{copied ? "Copied!" : "Copy Staff UID"}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded border rule bg-[var(--surface)] px-3 py-1.5 font-mono text-xs text-[var(--ink)] hover:border-[var(--brass)] transition-colors"
          >
            <Printer className="h-3.5 w-3.5 text-[var(--brass)]" />
            <span>Print Dossier</span>
          </button>

          {canDelete && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 rounded border border-red-500/30 bg-red-500/10 px-3 py-1.5 font-mono text-xs text-red-500 hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 font-mono text-xs text-emerald-500 print:hidden">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Header Profile Card */}
      <div className="rounded-xl border rule bg-[var(--surface)] p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {record.passport ? (
              <img
                src={record.passport}
                alt={fullName}
                className="h-28 w-28 shrink-0 rounded-xl border-2 border-[var(--brass)]/40 object-cover shadow-md bg-[var(--bg)]"
              />
            ) : (
              <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-xl border rule bg-[var(--brass)]/15 text-3xl font-bold text-[var(--brass)]">
                {record.first_name[0]}
                {record.last_name[0]}
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-heading text-2xl font-bold text-[var(--ink)]">
                  {fullName}
                </h2>
                <button
                  onClick={handleToggleIdCard}
                  disabled={updatingIdCard || !canUpdate}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border transition-all ${
                    record.idcard
                      ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25"
                      : "border-amber-500/30 bg-amber-500/15 text-amber-500 hover:bg-amber-500/25"
                  }`}
                  title="Toggle ID card issuance"
                >
                  {record.idcard ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>ID Card Issued</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3.5 w-3.5" />
                      <span>ID Card Pending</span>
                    </>
                  )}
                </button>
              </div>

              <div className="font-mono text-sm text-[var(--brass)]">
                {record.designation || "Staff Member"} • {record.department || "General Operations"}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 pt-2 font-mono text-xs text-[var(--muted-custom)]">
                <span className="flex items-center gap-2">
                  <Building className="h-3.5 w-3.5 text-[var(--brass)]" />
                  Workstation: <strong className="text-[var(--ink)]">{record.workstation || "Headquarters"}</strong>
                </span>
                <span className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-[var(--brass)]" />
                  Official: <strong className="text-[var(--ink)]">{record.company_email || "N/A"}</strong>
                </span>
                <span className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-[var(--muted-custom)]" />
                  Personal: <strong className="text-[var(--ink)]">{record.email}</strong>
                </span>
                <span className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-[var(--muted-custom)]" />
                  Contact: <strong className="text-[var(--ink)]">{record.phone_number}</strong>
                  {record.phone_number_2 ? ` / ${record.phone_number_2}` : ""}
                </span>
              </div>
            </div>
          </div>

          {/* ID Badge Quick Card preview */}
          <div className="shrink-0 rounded-lg border-2 border-dashed rule p-4 bg-[var(--bg)] w-full md:w-64 font-mono text-xs">
            <div className="text-[10px] uppercase font-bold text-[var(--brass)] tracking-widest text-center border-b rule pb-2">
              TR3-G INNOVATIONS ID
            </div>
            <div className="mt-2 space-y-1 text-center">
              <p className="font-semibold text-[var(--ink)]">{fullName}</p>
              <p className="text-[11px] text-[var(--muted-custom)]">{record.designation || "Personnel"}</p>
              <div className="mt-2 rounded bg-[var(--brass)]/15 py-1 px-2 font-bold text-[var(--brass)]">
                {record.staff_uid}
              </div>
              <div className="text-[9px] text-[var(--muted-custom)] pt-1">
                STATUS: {record.idcard ? "VALID & ACTIVE" : "ISSUANCE PENDING"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Details */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Personal & Demographics */}
        <div className="rounded-xl border rule bg-[var(--surface)] p-5 space-y-4">
          <div className="flex items-center gap-2 border-b rule pb-3">
            <User className="h-4 w-4 text-[var(--brass)]" />
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-[var(--ink)]">
              Personal Information & Origin
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4 font-mono text-xs">
            <div>
              <span className="text-[var(--muted-custom)] block">Date of Birth</span>
              <span className="font-semibold text-[var(--ink)]">
                {record.date_of_birth || "Not specified"}
              </span>
            </div>

            <div>
              <span className="text-[var(--muted-custom)] block">Gender</span>
              <span className="font-semibold text-[var(--ink)]">
                {record.gender || "Not specified"}
              </span>
            </div>

            <div>
              <span className="text-[var(--muted-custom)] block">Marital Status</span>
              <span className="font-semibold text-[var(--ink)]">
                {record.marital_status || "Not specified"}
              </span>
            </div>

            <div>
              <span className="text-[var(--muted-custom)] block">Disability Status</span>
              <span className="font-semibold text-[var(--ink)]">
                {record.disability || "None"}
              </span>
            </div>

            <div>
              <span className="text-[var(--muted-custom)] block">Nationality</span>
              <span className="font-semibold text-[var(--ink)]">
                {record.country || "Nigeria"}
              </span>
            </div>

            <div>
              <span className="text-[var(--muted-custom)] block">State of Origin</span>
              <span className="font-semibold text-[var(--ink)]">
                {record.state_of_origin || "N/A"}
              </span>
            </div>

            <div>
              <span className="text-[var(--muted-custom)] block">LGA of Origin</span>
              <span className="font-semibold text-[var(--ink)]">
                {record.lga_of_origin || "N/A"}
              </span>
            </div>

            <div>
              <span className="text-[var(--muted-custom)] block">Current State</span>
              <span className="font-semibold text-[var(--ink)]">
                {record.current_state || "N/A"}
              </span>
            </div>

            <div>
              <span className="text-[var(--muted-custom)] block">Current LGA</span>
              <span className="font-semibold text-[var(--ink)]">
                {record.current_lga || "N/A"}
              </span>
            </div>

            <div className="col-span-2">
              <span className="text-[var(--muted-custom)] block">Current Residence Address</span>
              <span className="font-semibold text-[var(--ink)]">
                {record.current_address || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Institutional & Verification */}
        <div className="rounded-xl border rule bg-[var(--surface)] p-5 space-y-4">
          <div className="flex items-center gap-2 border-b rule pb-3">
            <Building className="h-4 w-4 text-[var(--brass)]" />
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-[var(--ink)]">
              Institutional Placement & Reference
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4 font-mono text-xs">
            <div>
              <span className="text-[var(--muted-custom)] block">Staff UID</span>
              <span className="font-bold text-[var(--brass)]">{record.staff_uid}</span>
            </div>

            <div>
              <span className="text-[var(--muted-custom)] block">Department</span>
              <span className="font-semibold text-[var(--ink)]">
                {record.department || "General"}
              </span>
            </div>

            <div>
              <span className="text-[var(--muted-custom)] block">Designation</span>
              <span className="font-semibold text-[var(--ink)]">
                {record.designation || "Staff Member"}
              </span>
            </div>

            <div>
              <span className="text-[var(--muted-custom)] block">Workstation</span>
              <span className="font-semibold text-[var(--ink)]">
                {record.workstation || "Headquarters"}
              </span>
            </div>

            <div className="col-span-2">
              <span className="text-[var(--muted-custom)] block">Company Email</span>
              <span className="font-semibold text-[var(--ink)]">
                {record.company_email || "N/A"}
              </span>
            </div>

            <div className="col-span-2">
              <span className="text-[var(--muted-custom)] block">Professional Reference</span>
              <span className="font-semibold text-[var(--ink)]">
                {record.reference || "None provided"}
              </span>
            </div>

            <div>
              <span className="text-[var(--muted-custom)] block">ID Card Issued</span>
              <span
                className={`font-bold ${
                  record.idcard ? "text-emerald-500" : "text-amber-500"
                }`}
              >
                {record.idcard ? "Yes (Active)" : "No (Pending)"}
              </span>
            </div>

            <div>
              <span className="text-[var(--muted-custom)] block">Enrolled At</span>
              <span className="text-[var(--ink)]">
                {new Date(record.created_at).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Official Identification (NIN & Physical ID Photos) */}
      <div className="rounded-xl border rule bg-[var(--surface)] p-5 space-y-4">
        <div className="flex items-center justify-between border-b rule pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-[var(--brass)]" />
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-[var(--ink)]">
              National Identification (NIN) & Documents
            </h3>
          </div>
          {record.identification_nin && (
            <span className="font-mono text-xs font-bold text-[var(--ink)] bg-[var(--bg)] px-3 py-1 rounded border rule">
              NIN: {record.identification_nin}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          {/* ID Front */}
          <div className="space-y-2">
            <span className="font-mono text-xs text-[var(--muted-custom)] block">
              Identity Document (Front)
            </span>
            {record.id_card_front ? (
              <div className="overflow-hidden rounded-lg border rule bg-[var(--bg)]">
                <img
                  src={record.id_card_front}
                  alt="Identity Card Front"
                  className="w-full max-h-72 object-contain bg-black/5"
                />
                <div className="p-2 text-right">
                  <a
                    href={record.id_card_front}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-[11px] text-[var(--brass)] hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>View Full Size</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed rule bg-[var(--bg)] font-mono text-xs text-[var(--muted-custom)]">
                No front document uploaded
              </div>
            )}
          </div>

          {/* ID Back */}
          <div className="space-y-2">
            <span className="font-mono text-xs text-[var(--muted-custom)] block">
              Identity Document (Back)
            </span>
            {record.id_card_back ? (
              <div className="overflow-hidden rounded-lg border rule bg-[var(--bg)]">
                <img
                  src={record.id_card_back}
                  alt="Identity Card Back"
                  className="w-full max-h-72 object-contain bg-black/5"
                />
                <div className="p-2 text-right">
                  <a
                    href={record.id_card_back}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-[11px] text-[var(--brass)] hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>View Full Size</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed rule bg-[var(--bg)] font-mono text-xs text-[var(--muted-custom)]">
                No back document uploaded
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Guarantors Section (Note two guarantors) */}
      <div className="rounded-xl border rule bg-[var(--surface)] p-5 space-y-4">
        <div className="flex items-center gap-2 border-b rule pb-3">
          <Users className="h-4 w-4 text-[var(--brass)]" />
          <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-[var(--ink)]">
            Verified Guarantors (Two Required)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Guarantor 1 */}
          <div className="rounded-lg border rule bg-[var(--bg)] p-4 space-y-3">
            <div className="flex items-center justify-between border-b rule pb-2">
              <span className="font-mono text-xs font-bold text-[var(--brass)] uppercase">
                First Guarantor
              </span>
              <span className="font-mono text-[11px] text-[var(--muted-custom)]">
                Primary
              </span>
            </div>

            <div className="flex items-start gap-3">
              {record.guarantor_1?.passport ? (
                <img
                  src={record.guarantor_1.passport}
                  alt={record.guarantor_1.full_name || "Guarantor 1"}
                  className="h-16 w-16 shrink-0 rounded-lg border rule object-cover bg-[var(--surface)]"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border rule bg-[var(--surface)] font-mono text-xs text-[var(--muted-custom)]">
                  No Photo
                </div>
              )}

              <div className="space-y-1 font-mono text-xs min-w-0">
                <p className="font-semibold text-sm text-[var(--ink)] truncate">
                  {record.guarantor_1?.full_name || "Not provided"}
                </p>
                <p className="text-[var(--muted-custom)] flex items-center gap-1 truncate">
                  <Mail className="h-3 w-3 shrink-0" />
                  {record.guarantor_1?.email || "N/A"}
                </p>
                <p className="text-[var(--muted-custom)] flex items-center gap-1">
                  <Phone className="h-3 w-3 shrink-0" />
                  {record.guarantor_1?.phone || "N/A"}
                </p>
              </div>
            </div>

            <div className="font-mono text-xs pt-1 border-t rule">
              <span className="text-[var(--muted-custom)] block text-[11px]">Address:</span>
              <p className="text-[var(--ink)] text-xs">
                {record.guarantor_1?.address || "Not provided"}
              </p>
            </div>
          </div>

          {/* Guarantor 2 */}
          <div className="rounded-lg border rule bg-[var(--bg)] p-4 space-y-3">
            <div className="flex items-center justify-between border-b rule pb-2">
              <span className="font-mono text-xs font-bold text-[var(--brass)] uppercase">
                Second Guarantor
              </span>
              <span className="font-mono text-[11px] text-[var(--muted-custom)]">
                Secondary
              </span>
            </div>

            <div className="flex items-start gap-3">
              {record.guarantor_2?.passport ? (
                <img
                  src={record.guarantor_2.passport}
                  alt={record.guarantor_2.full_name || "Guarantor 2"}
                  className="h-16 w-16 shrink-0 rounded-lg border rule object-cover bg-[var(--surface)]"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border rule bg-[var(--surface)] font-mono text-xs text-[var(--muted-custom)]">
                  No Photo
                </div>
              )}

              <div className="space-y-1 font-mono text-xs min-w-0">
                <p className="font-semibold text-sm text-[var(--ink)] truncate">
                  {record.guarantor_2?.full_name || "Not provided"}
                </p>
                <p className="text-[var(--muted-custom)] flex items-center gap-1 truncate">
                  <Mail className="h-3 w-3 shrink-0" />
                  {record.guarantor_2?.email || "N/A"}
                </p>
                <p className="text-[var(--muted-custom)] flex items-center gap-1">
                  <Phone className="h-3 w-3 shrink-0" />
                  {record.guarantor_2?.phone || "N/A"}
                </p>
              </div>
            </div>

            <div className="font-mono text-xs pt-1 border-t rule">
              <span className="text-[var(--muted-custom)] block text-[11px]">Address:</span>
              <p className="text-[var(--ink)] text-xs">
                {record.guarantor_2?.address || "Not provided"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
