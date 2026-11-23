"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  User,
  Shield,
  Upload,
  CheckCircle2,
  AlertCircle,
  Building,
  CreditCard,
  MapPin,
  Users,
  Eye,
  Plus,
} from "lucide-react"
import { useAdminAuth } from "@/hooks/use-admin-auth"

export default function AdminBioDataNewPage() {
  const router = useRouter()
  const { canCreate } = useAdminAuth()

  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState("")
  const [createdRecord, setCreatedRecord] = React.useState<{ id: string; staff_uid: string } | null>(null)

  // Personal
  const [firstName, setFirstName] = React.useState("")
  const [lastName, setLastName] = React.useState("")
  const [otherName, setOtherName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [phone2, setPhone2] = React.useState("")
  const [maritalStatus, setMaritalStatus] = React.useState("Single")
  const [dob, setDob] = React.useState("")
  const [gender, setGender] = React.useState("Male")
  const [disability, setDisability] = React.useState("None")

  // Location
  const [country, setCountry] = React.useState("Nigeria")
  const [stateOfOrigin, setStateOfOrigin] = React.useState("")
  const [lgaOfOrigin, setLgaOfOrigin] = React.useState("")
  const [currentState, setCurrentState] = React.useState("")
  const [currentLga, setCurrentLga] = React.useState("")
  const [currentAddress, setCurrentAddress] = React.useState("")

  // Institutional
  const [designation, setDesignation] = React.useState("")
  const [department, setDepartment] = React.useState("")
  const [workstation, setWorkstation] = React.useState("TR3-G Headquarters (Abuja)")
  const [companyEmail, setCompanyEmail] = React.useState("")
  const [reference, setReference] = React.useState("")
  const [idcard, setIdcard] = React.useState(false)

  // Identification
  const [nin, setNin] = React.useState("")

  // Guarantor 1
  const [g1Name, setG1Name] = React.useState("")
  const [g1Email, setG1Email] = React.useState("")
  const [g1Phone, setG1Phone] = React.useState("")
  const [g1Address, setG1Address] = React.useState("")

  // Guarantor 2
  const [g2Name, setG2Name] = React.useState("")
  const [g2Email, setG2Email] = React.useState("")
  const [g2Phone, setG2Phone] = React.useState("")
  const [g2Address, setG2Address] = React.useState("")

  // Files
  const [passportFile, setPassportFile] = React.useState<File | null>(null)
  const [passportPreview, setPassportPreview] = React.useState<string | null>(null)

  const [idFrontFile, setIdFrontFile] = React.useState<File | null>(null)
  const [idFrontPreview, setIdFrontPreview] = React.useState<string | null>(null)

  const [idBackFile, setIdBackFile] = React.useState<File | null>(null)
  const [idBackPreview, setIdBackPreview] = React.useState<string | null>(null)

  const [g1PassportFile, setG1PassportFile] = React.useState<File | null>(null)
  const [g1PassportPreview, setG1PassportPreview] = React.useState<string | null>(null)

  const [g2PassportFile, setG2PassportFile] = React.useState<File | null>(null)
  const [g2PassportPreview, setG2PassportPreview] = React.useState<string | null>(null)

  const handleFileChange = (
    file: File | null,
    setter: (f: File | null) => void,
    previewSetter: (s: string | null) => void
  ) => {
    setter(file)
    if (file) {
      const url = URL.createObjectURL(file)
      previewSetter(url)
    } else {
      previewSetter(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim()) {
      setError("Please fill in all required personal contact fields (First Name, Last Name, Email, Phone).")
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }

    try {
      setSubmitting(true)
      const fd = new FormData()

      // Personal
      fd.append("first_name", firstName.trim())
      fd.append("last_name", lastName.trim())
      fd.append("other_name", otherName.trim())
      fd.append("email", email.trim().toLowerCase())
      fd.append("phone_number", phone.trim())
      fd.append("phone_number_2", phone2.trim())
      fd.append("marital_status", maritalStatus)
      fd.append("date_of_birth", dob)
      fd.append("gender", gender)
      fd.append("disability", disability.trim() || "None")

      // Location
      fd.append("country", country.trim())
      fd.append("state_of_origin", stateOfOrigin.trim())
      fd.append("lga_of_origin", lgaOfOrigin.trim())
      fd.append("current_state_of_residence", currentState.trim())
      fd.append("current_lga_of_residence", currentLga.trim())
      fd.append("current_residence_address", currentAddress.trim())

      // Institutional
      fd.append("designation", designation.trim())
      fd.append("department", department.trim())
      fd.append("workstation", workstation.trim())
      fd.append("company_email", companyEmail.trim())
      fd.append("reference", reference.trim())
      fd.append("idcard", idcard ? "true" : "false")

      // Identification
      fd.append("identification_nin", nin.trim())

      // Guarantor 1
      fd.append("guarantor_1_name", g1Name.trim())
      fd.append("guarantor_1_email", g1Email.trim())
      fd.append("guarantor_1_phone", g1Phone.trim())
      fd.append("guarantor_1_address", g1Address.trim())

      // Guarantor 2
      fd.append("guarantor_2_name", g2Name.trim())
      fd.append("guarantor_2_email", g2Email.trim())
      fd.append("guarantor_2_phone", g2Phone.trim())
      fd.append("guarantor_2_address", g2Address.trim())

      // File uploads
      if (passportFile) fd.append("passport", passportFile)
      if (idFrontFile) fd.append("id_card_front", idFrontFile)
      if (idBackFile) fd.append("id_card_back", idBackFile)
      if (g1PassportFile) fd.append("guarantor_1_passport", g1PassportFile)
      if (g2PassportFile) fd.append("guarantor_2_passport", g2PassportFile)

      const res = await fetch("/api/public/biodata", {
        method: "POST",
        body: fd,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit biodata record")
      }

      setCreatedRecord({
        id: data.id,
        staff_uid: data.staff_uid || "SUCCESS",
      })
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.")
      window.scrollTo({ top: 0, behavior: "smooth" })
    } finally {
      setSubmitting(false)
    }
  }

  if (createdRecord) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 py-8">
        <div className="rounded-2xl border border-emerald-500/30 bg-[var(--surface)] p-8 text-center space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <div className="space-y-2">
            <h2 className="font-heading text-2xl font-bold text-[var(--ink)]">
              Personnel Successfully Enrolled
            </h2>
            <p className="font-mono text-xs text-[var(--muted-custom)]">
              The BioData record has been verified and stored in the central personnel registry.
            </p>
          </div>

          <div className="rounded-xl border border-[var(--brass)]/30 bg-[var(--brass)]/10 p-5 font-mono">
            <span className="text-xs uppercase text-[var(--muted-custom)] block">
              Assigned Staff UID
            </span>
            <div className="mt-1 text-2xl font-bold tracking-wider text-[var(--brass)]">
              {createdRecord.staff_uid}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Link
              href={`/admin/biodata/${createdRecord.id}`}
              className="flex items-center gap-1.5 rounded-lg bg-[var(--brass)] px-5 py-2.5 font-mono text-xs font-semibold text-black hover:opacity-90 transition-opacity"
            >
              <Eye className="h-4 w-4" />
              <span>View Enrolled Profile & ID</span>
            </Link>

            <button
              onClick={() => {
                setCreatedRecord(null)
                setFirstName("")
                setLastName("")
                setOtherName("")
                setEmail("")
                setPhone("")
                setPhone2("")
                setNin("")
                setReference("")
                setDesignation("")
                setDepartment("")
                setPassportFile(null)
                setPassportPreview(null)
                setIdFrontFile(null)
                setIdFrontPreview(null)
                setIdBackFile(null)
                setIdBackPreview(null)
              }}
              className="flex items-center gap-1.5 rounded-lg border rule bg-[var(--bg)] px-5 py-2.5 font-mono text-xs text-[var(--ink)] hover:border-[var(--brass)] transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Enroll Another Staff</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/biodata"
          className="rounded border rule bg-[var(--surface)] p-2 text-[var(--muted-custom)] hover:text-[var(--ink)] hover:border-[var(--brass)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="font-heading text-xl font-bold text-[var(--ink)]">
            Enroll New Staff BioData
          </h1>
          <p className="font-mono text-xs text-[var(--muted-custom)]">
            Create an official personnel profile with guarantors, identity proof, and auto-generated Staff UID.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-4 font-mono text-xs text-red-500">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: Personal Details */}
        <div className="rounded-xl border rule bg-[var(--surface)] p-6 space-y-4">
          <div className="flex items-center gap-2 border-b rule pb-3">
            <User className="h-4 w-4 text-[var(--brass)]" />
            <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-[var(--ink)]">
              1. Personal Information & Demographics
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div>
              <label className="block text-[var(--muted-custom)] mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. John"
                className="w-full rounded-md border rule bg-[var(--bg)] px-3 py-2 text-[var(--ink)] focus:border-[var(--brass)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[var(--muted-custom)] mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Doe"
                className="w-full rounded-md border rule bg-[var(--bg)] px-3 py-2 text-[var(--ink)] focus:border-[var(--brass)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[var(--muted-custom)] mb-1">
                Other Name
              </label>
              <input
                type="text"
                value={otherName}
                onChange={(e) => setOtherName(e.target.value)}
                placeholder="Middle name (optional)"
                className="w-full rounded-md border rule bg-[var(--bg)] px-3 py-2 text-[var(--ink)] focus:border-[var(--brass)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[var(--muted-custom)] mb-1">
                Personal Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john.doe@example.com"
                className="w-full rounded-md border rule bg-[var(--bg)] px-3 py-2 text-[var(--ink)] focus:border-[var(--brass)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[var(--muted-custom)] mb-1">
                Primary Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 801 234 5678"
                className="w-full rounded-md border rule bg-[var(--bg)] px-3 py-2 text-[var(--ink)] focus:border-[var(--brass)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[var(--muted-custom)] mb-1">
                Alternate Phone Number
              </label>
              <input
                type="tel"
                value={phone2}
                onChange={(e) => setPhone2(e.target.value)}
                placeholder="+234 809 876 5432"
                className="w-full rounded-md border rule bg-[var(--bg)] px-3 py-2 text-[var(--ink)] focus:border-[var(--brass)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[var(--muted-custom)] mb-1">
                Marital Status
              </label>
              <select
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value)}
                className="w-full rounded-md border rule bg-[var(--bg)] px-3 py-2 text-[var(--ink)] focus:border-[var(--brass)] focus:outline-none"
              >
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>

            <div>
              <label className="block text-[var(--muted-custom)] mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full rounded-md border rule bg-[var(--bg)] px-3 py-2 text-[var(--ink)] focus:border-[var(--brass)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[var(--muted-custom)] mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-md border rule bg-[var(--bg)] px-3 py-2 text-[var(--ink)] focus:border-[var(--brass)] focus:outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[var(--muted-custom)] mb-1">
                Disability / Special Needs (if any)
              </label>
              <input
                type="text"
                value={disability}
                onChange={(e) => setDisability(e.target.value)}
                placeholder="State 'None' or describe condition"
                className="w-full rounded-md border rule bg-[var(--bg)] px-3 py-2 text-[var(--ink)] focus:border-[var(--brass)] focus:outline-none"
              />
            </div>

            {/* Passport Photo */}
            <div className="sm:col-span-3 pt-2">
              <label className="block text-[var(--muted-custom)] mb-1">
                Staff Passport Photo (Cloudinary upload)
              </label>
              <div className="flex items-center gap-4">
                {passportPreview ? (
                  <img
                    src={passportPreview}
                    alt="Preview"
                    className="h-16 w-16 rounded-lg object-cover border-2 border-[var(--brass)]"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-lg border-2 border-dashed rule flex items-center justify-center text-[var(--muted-custom)]">
                    <User className="h-6 w-6" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFileChange(
                      e.target.files?.[0] || null,
                      setPassportFile,
                      setPassportPreview
                    )
                  }
                  className="font-mono text-xs text-[var(--muted-custom)] file:mr-3 file:rounded file:border-0 file:bg-[var(--brass)]/15 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[var(--brass)] hover:file:bg-[var(--brass)]/25 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Origin & Residence */}
        <div className="rounded-xl border rule bg-[var(--surface)] p-6 space-y-4">
          <div className="flex items-center gap-2 border-b rule pb-3">
            <MapPin className="h-4 w-4 text-[var(--brass)]" />
            <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-[var(--ink)]">
              2. Geographic Origin & Residence
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div>
              <label className="block text-[var(--muted-custom)] mb-1">
                Nationality
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-md border rule bg-[var(--bg)] px-3 py-2 text-[var(--ink)] focus:border-[var(--brass)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[var(--muted-custom)] mb-1">
                State of Origin
              </label>
              <input
                type="text"
                value={stateOfOrigin}
                onChange={(e) => setStateOfOrigin(e.target.value)}
                placeholder="e.g. Kogi"
                className="w-full rounded-md border rule bg-[var(--bg)] px-3 py-2 text-[var(--ink)] focus:border-[var(--brass)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[var(--muted-custom)] mb-1">
                LGA of Origin
              </label>
              <input
                type="text"
                value={lgaOfOrigin}
                onChange={(e) => setLgaOfOrigin(e.target.value)}
                placeholder="e.g. Dekina"
                className="w-full rounded-md border rule bg-[var(--bg)] px-3 py-2 text-[var(--ink)] focus:border-[var(--brass)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[var(--muted-custom)] mb-1">
                Current State of Residence
              </label>
              <input
                type="text"
                value={currentState}
                onChange={(e) => setCurrentState(e.target.value)}
                placeholder="e.g. FCT Abuja"
                className="w-full rounded-md border rule bg-[var(--bg)] px-3 py-2 text-[var(--ink)] focus:border-[var(--brass)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[var(--muted-custom)] mb-1">
                Current LGA of Residence
              </label>
              <input
                type="text"
                value={currentLga}
                onChange={(e) => setCurrentLga(e.target.value)}
                placeholder="e.g. Kuje"
                className="w-full rounded-md border rule bg-[var(--bg)] px-3 py-2 text-[var(--ink)] focus:border-[var(--brass)] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[var(--muted-custom)] mb-1">
                Current Residence Address
              </label>
              <input
                type="text"
                value={currentAddress}
                onChange={(e) => setCurrentAddress(e.target.value)}
                placeholder="e.g. AA2 Behind Arena Off Dunamis Church, Kuje Abuja"
                className="w-full rounded-md border rule bg-[var(--bg)] px-3 py-2 text-[var(--ink)] focus:border-[var(--brass)] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Institutional Placement */}
        <div className="rounded-xl border rule bg-[var(--surface)] p-6 space-y-4">
          <div className="flex items-center gap-2 border-b rule pb-3">
            <Building className="h-4 w-4 text-[var(--brass)]" />
            <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-[var(--ink)]">
              3. Institutional Placement & Workstation
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            <div>
              <label className="block text-[var(--muted-custom)] mb-1">
                Designation / Job Role
              </label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                className="w-full rounded-md border rule bg-[var(--bg)] px-3 py-2 text-[var(--ink)] focus:border-[var(--brass)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[var(--muted-custom)] mb-1">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Engineering & Systems"
                className="w-full rounded-md border rule bg-[var(--bg)] px-3 py-2 text-[var(--ink)] focus:border-[var(--brass)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[var(--muted-custom)] mb-1">
                Workstation Location
              </label>
              <input
                type="text"
                value={workstation}
                onChange={(e) => setWorkstation(e.target.value)}
                placeholder="e.g. TR3-G Abuja HQ / Remote"
                className="w-full rounded-md border rule bg-[var(--bg)] px-3 py-2 text-[var(--ink)] focus:border-[var(--brass)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[var(--muted-custom)] mb-1">
                Official Company Email
              </label>
              <input
                type="email"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                placeholder="staff@tr3-g.com.ng"
                className="w-full rounded-md border rule bg-[var(--bg)] px-3 py-2 text-[var(--ink)] focus:border-[var(--brass)] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[var(--muted-custom)] mb-1">
                Professional Reference
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Reference person name, title, organization, or contact"
                className="w-full rounded-md border rule bg-[var(--bg)] px-3 py-2 text-[var(--ink)] focus:border-[var(--brass)] focus:outline-none"
              />
            </div>

            {/* ID Card issuance toggle */}
            <div className="sm:col-span-2 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={idcard}
                  onChange={(e) => setIdcard(e.target.checked)}
                  className="h-4 w-4 rounded border rule text-[var(--brass)] focus:ring-[var(--brass)] accent-[var(--brass)] cursor-pointer"
                />
                <span className="font-mono text-xs text-[var(--ink)] font-semibold">
                  Official ID Card Already Issued
                </span>
              </label>
              <span className="block font-mono text-[11px] text-[var(--muted-custom)] pl-7 mt-0.5">
                Check this if the personnel has already been provided a physical or digital corporate badge.
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 4: Identification & NIN */}
        <div className="rounded-xl border rule bg-[var(--surface)] p-6 space-y-4">
          <div className="flex items-center gap-2 border-b rule pb-3">
            <Shield className="h-4 w-4 text-[var(--brass)]" />
            <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-[var(--ink)]">
              4. National Identity (NIN) & Physical Document Upload
            </h2>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-[var(--muted-custom)] mb-1">
                National Identification Number (NIN)
              </label>
              <input
                type="text"
                value={nin}
                onChange={(e) => setNin(e.target.value)}
                placeholder="11-digit NIN (e.g. 12345678901)"
                className="w-full sm:w-80 rounded-md border rule bg-[var(--bg)] px-3 py-2 text-[var(--ink)] focus:border-[var(--brass)] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              {/* ID Front */}
              <div>
                <label className="block text-[var(--muted-custom)] mb-1">
                  ID Card Front Photo
                </label>
                <div className="flex items-center gap-3">
                  {idFrontPreview ? (
                    <img
                      src={idFrontPreview}
                      alt="Front Preview"
                      className="h-16 w-24 rounded-lg object-cover border rule"
                    />
                  ) : null}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleFileChange(
                        e.target.files?.[0] || null,
                        setIdFrontFile,
                        setIdFrontPreview
                      )
                    }
                    className="font-mono text-xs text-[var(--muted-custom)] file:mr-3 file:rounded file:border-0 file:bg-[var(--brass)]/15 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[var(--brass)] hover:file:bg-[var(--brass)]/25 cursor-pointer"
                  />
                </div>
              </div>

              {/* ID Back */}
              <div>
                <label className="block text-[var(--muted-custom)] mb-1">
                  ID Card Back Photo
                </label>
                <div className="flex items-center gap-3">
                  {idBackPreview ? (
                    <img
                      src={idBackPreview}
                      alt="Back Preview"
                      className="h-16 w-24 rounded-lg object-cover border rule"
                    />
                  ) : null}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleFileChange(
                        e.target.files?.[0] || null,
                        setIdBackFile,
                        setIdBackPreview
                      )
                    }
                    className="font-mono text-xs text-[var(--muted-custom)] file:mr-3 file:rounded file:border-0 file:bg-[var(--brass)]/15 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[var(--brass)] hover:file:bg-[var(--brass)]/25 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: Guarantors (Two guarantors) */}
        <div className="rounded-xl border rule bg-[var(--surface)] p-6 space-y-6">
          <div className="flex items-center gap-2 border-b rule pb-3">
            <Users className="h-4 w-4 text-[var(--brass)]" />
            <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-[var(--ink)]">
              5. Guarantors (Two Required)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Guarantor 1 */}
            <div className="rounded-lg border rule bg-[var(--bg)] p-4 space-y-3 font-mono text-xs">
              <span className="font-bold text-[var(--brass)] uppercase block border-b rule pb-1">
                Guarantor 1 (Primary)
              </span>

              <div>
                <label className="block text-[var(--muted-custom)] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={g1Name}
                  onChange={(e) => setG1Name(e.target.value)}
                  placeholder="Guarantor 1 full name"
                  className="w-full rounded-md border rule bg-[var(--surface)] px-3 py-1.5 text-[var(--ink)] focus:border-[var(--brass)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[var(--muted-custom)] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={g1Email}
                  onChange={(e) => setG1Email(e.target.value)}
                  placeholder="guarantor1@example.com"
                  className="w-full rounded-md border rule bg-[var(--surface)] px-3 py-1.5 text-[var(--ink)] focus:border-[var(--brass)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[var(--muted-custom)] mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={g1Phone}
                  onChange={(e) => setG1Phone(e.target.value)}
                  placeholder="+234 801 111 2222"
                  className="w-full rounded-md border rule bg-[var(--surface)] px-3 py-1.5 text-[var(--ink)] focus:border-[var(--brass)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[var(--muted-custom)] mb-1">
                  Residential / Office Address
                </label>
                <input
                  type="text"
                  value={g1Address}
                  onChange={(e) => setG1Address(e.target.value)}
                  placeholder="Address of Guarantor 1"
                  className="w-full rounded-md border rule bg-[var(--surface)] px-3 py-1.5 text-[var(--ink)] focus:border-[var(--brass)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[var(--muted-custom)] mb-1">
                  Passport Photograph
                </label>
                <div className="flex items-center gap-2">
                  {g1PassportPreview && (
                    <img
                      src={g1PassportPreview}
                      alt="G1"
                      className="h-10 w-10 rounded object-cover border rule"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleFileChange(
                        e.target.files?.[0] || null,
                        setG1PassportFile,
                        setG1PassportPreview
                      )
                    }
                    className="font-mono text-[11px] text-[var(--muted-custom)] file:mr-2 file:rounded file:border-0 file:bg-[var(--brass)]/15 file:px-2 file:py-1 file:text-[11px] file:text-[var(--brass)] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Guarantor 2 */}
            <div className="rounded-lg border rule bg-[var(--bg)] p-4 space-y-3 font-mono text-xs">
              <span className="font-bold text-[var(--brass)] uppercase block border-b rule pb-1">
                Guarantor 2 (Secondary)
              </span>

              <div>
                <label className="block text-[var(--muted-custom)] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={g2Name}
                  onChange={(e) => setG2Name(e.target.value)}
                  placeholder="Guarantor 2 full name"
                  className="w-full rounded-md border rule bg-[var(--surface)] px-3 py-1.5 text-[var(--ink)] focus:border-[var(--brass)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[var(--muted-custom)] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={g2Email}
                  onChange={(e) => setG2Email(e.target.value)}
                  placeholder="guarantor2@example.com"
                  className="w-full rounded-md border rule bg-[var(--surface)] px-3 py-1.5 text-[var(--ink)] focus:border-[var(--brass)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[var(--muted-custom)] mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={g2Phone}
                  onChange={(e) => setG2Phone(e.target.value)}
                  placeholder="+234 802 222 3333"
                  className="w-full rounded-md border rule bg-[var(--surface)] px-3 py-1.5 text-[var(--ink)] focus:border-[var(--brass)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[var(--muted-custom)] mb-1">
                  Residential / Office Address
                </label>
                <input
                  type="text"
                  value={g2Address}
                  onChange={(e) => setG2Address(e.target.value)}
                  placeholder="Address of Guarantor 2"
                  className="w-full rounded-md border rule bg-[var(--surface)] px-3 py-1.5 text-[var(--ink)] focus:border-[var(--brass)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[var(--muted-custom)] mb-1">
                  Passport Photograph
                </label>
                <div className="flex items-center gap-2">
                  {g2PassportPreview && (
                    <img
                      src={g2PassportPreview}
                      alt="G2"
                      className="h-10 w-10 rounded object-cover border rule"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleFileChange(
                        e.target.files?.[0] || null,
                        setG2PassportFile,
                        setG2PassportPreview
                      )
                    }
                    className="font-mono text-[11px] text-[var(--muted-custom)] file:mr-2 file:rounded file:border-0 file:bg-[var(--brass)]/15 file:px-2 file:py-1 file:text-[11px] file:text-[var(--brass)] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between rounded-xl border rule bg-[var(--surface)] p-4">
          <Link
            href="/admin/biodata"
            className="rounded border rule bg-[var(--bg)] px-4 py-2 font-mono text-xs text-[var(--muted-custom)] hover:text-[var(--ink)] transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded bg-[var(--brass)] px-6 py-2.5 font-mono text-xs font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                <span>Enrolling Staff Member...</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>Complete Staff Enrollment</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
