"use client"

import * as React from "react"
import Link from "next/link"
import {
  User,
  Shield,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  MapPin,
  Users,
  CreditCard,
  Building,
  Briefcase,
  ArrowRight,
  Sparkles,
} from "lucide-react"

export default function PublicBioDataCreatePage() {
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState("")
  const [submittedUid, setSubmittedUid] = React.useState<string | null>(null)

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
  const [stateOfOrigin, setStateOfOrigin] = React.useState("")
  const [lgaOfOrigin, setLgaOfOrigin] = React.useState("")
  const [currentState, setCurrentState] = React.useState("")
  const [currentLga, setCurrentLga] = React.useState("")
  const [currentAddress, setCurrentAddress] = React.useState("")
  const [country, setCountry] = React.useState("Nigeria")

  // Guarantor 1
  const [g1Name, setG1Name] = React.useState("")
  const [g1Email, setG1Email] = React.useState("")
  const [g1Phone, setG1Phone] = React.useState("")
  const [g1Address, setG1Address] = React.useState("")
  const [g1Passport, setG1Passport] = React.useState<File | null>(null)

  // Guarantor 2
  const [g2Name, setG2Name] = React.useState("")
  const [g2Email, setG2Email] = React.useState("")
  const [g2Phone, setG2Phone] = React.useState("")
  const [g2Address, setG2Address] = React.useState("")
  const [g2Passport, setG2Passport] = React.useState<File | null>(null)

  // Identification
  const [nin, setNin] = React.useState("")
  const [passportFile, setPassportFile] = React.useState<File | null>(null)
  const [idFrontFile, setIdFrontFile] = React.useState<File | null>(null)
  const [idBackFile, setIdBackFile] = React.useState<File | null>(null)

  // Institutional
  const [designation, setDesignation] = React.useState("")
  const [department, setDepartment] = React.useState("")
  const [workstation, setWorkstation] = React.useState("")
  const [companyEmail, setCompanyEmail] = React.useState("")
  const [reference, setReference] = React.useState("")
  const [idCard, setIdCard] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim()) {
      setError("Please complete all required personal fields (First Name, Last Name, Email, Phone).")
      return
    }

    setSubmitting(true)

    try {
      const formData = new FormData()

      // Personal
      formData.append("first_name", firstName.trim())
      formData.append("last_name", lastName.trim())
      formData.append("other_name", otherName.trim())
      formData.append("email", email.trim())
      formData.append("phone_number", phone.trim())
      formData.append("phone_number_2", phone2.trim())
      formData.append("marital_status", maritalStatus)
      formData.append("date_of_birth", dob)
      formData.append("gender", gender)
      formData.append("disability", disability.trim() || "None")

      // Location
      formData.append("state_of_origin", stateOfOrigin.trim())
      formData.append("lga_of_origin", lgaOfOrigin.trim())
      formData.append("current_state_of_residence", currentState.trim())
      formData.append("current_lga_of_residence", currentLga.trim())
      formData.append("current_residence_address", currentAddress.trim())
      formData.append("country", country.trim())

      // Files
      if (passportFile) formData.append("passport", passportFile)
      if (idFrontFile) formData.append("id_card_front", idFrontFile)
      if (idBackFile) formData.append("id_card_back", idBackFile)

      // Guarantors
      formData.append("guarantor_1_name", g1Name.trim())
      formData.append("guarantor_1_email", g1Email.trim())
      formData.append("guarantor_1_phone", g1Phone.trim())
      formData.append("guarantor_1_address", g1Address.trim())
      if (g1Passport) formData.append("guarantor_1_passport", g1Passport)

      formData.append("guarantor_2_name", g2Name.trim())
      formData.append("guarantor_2_email", g2Email.trim())
      formData.append("guarantor_2_phone", g2Phone.trim())
      formData.append("guarantor_2_address", g2Address.trim())
      if (g2Passport) formData.append("guarantor_2_passport", g2Passport)

      // Identification
      formData.append("identification_nin", nin.trim())

      // Institutional
      formData.append("designation", designation.trim())
      formData.append("department", department.trim())
      formData.append("workstation", workstation.trim())
      formData.append("company_email", companyEmail.trim())
      formData.append("reference", reference.trim())
      formData.append("idcard", idCard ? "true" : "false")

      const res = await fetch("/api/public/biodata", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit BioData")
      }

      setSubmittedUid(data.staff_uid)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during submission.")
    } finally {
      setSubmitting(false)
    }
  }

  if (submittedUid) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <div className="rounded-xl border border-emerald-500/30 bg-[var(--surface)] p-8 sm:p-12 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <p className="font-mono text-xs uppercase tracking-widest text-emerald-400 font-semibold mb-2">
            REGISTRATION COMPLETE
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[var(--ink)]">
            BioData Enrolled Successfully
          </h1>
          <p className="mt-3 text-sm text-[var(--muted-custom)] max-w-lg mx-auto leading-relaxed">
            Your institutional record has been securely saved in the TR3-G persistent datastore and queued for internal audit verification.
          </p>

          <div className="my-8 rounded-lg border rule-strong bg-[var(--surface-2)] p-6 max-w-md mx-auto">
            <span className="font-mono text-xs text-[var(--muted-custom)] uppercase">
              Assigned Institutional UID
            </span>
            <p className="font-mono text-2xl font-bold brass-text mt-1 tracking-wider">
              {submittedUid}
            </p>
            <p className="mt-2 text-[11px] text-[var(--muted-custom)] font-mono">
              Please preserve this UID for all internal HR, workstation access, and ID card inquiries.
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <Link href="/" className="btn-brass px-6 py-2.5 rounded text-xs font-semibold">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="border-b rule pb-8 mb-10">
        <p className="font-mono text-xs uppercase tracking-widest teal-text font-semibold mb-2">
          HUMAN CAPITAL & COMPLIANCE
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[var(--ink)]">
          Personnel BioData Intake
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-custom)] leading-relaxed">
          Official enrollment document for TR3-G staff, engineers, and personnel. All credentials, guarantors, and national identifiers are audited under sovereign security protocols.
        </p>
      </div>

      {error && (
        <div className="mb-8 rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* 1. PERSONAL DETAILS */}
        <section className="rounded-lg border rule bg-[var(--surface)] p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b rule pb-4">
            <User className="h-5 w-5 brass-text shrink-0" />
            <div>
              <h2 className="font-display text-xl font-bold text-[var(--ink)]">
                1. Personal Details
              </h2>
              <p className="text-xs text-[var(--muted-custom)]">
                Legal name, contact channels, marital profile, and passport photograph.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block font-mono text-xs text-[var(--muted-custom)] mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Adebayo"
                className="w-full rounded border rule bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-[var(--muted-custom)] mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Ibrahim"
                className="w-full rounded border rule bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-[var(--muted-custom)] mb-1">
                Other Name
              </label>
              <input
                type="text"
                value={otherName}
                onChange={(e) => setOtherName(e.target.value)}
                placeholder="e.g. Chukwuma"
                className="w-full rounded border rule bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block font-mono text-xs text-[var(--muted-custom)] mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="adebayo@example.com"
                className="w-full rounded border rule bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-[var(--muted-custom)] mb-1">
                Primary Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 800 000 0000"
                className="w-full rounded border rule bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block font-mono text-xs text-[var(--muted-custom)] mb-1">
                Secondary Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={phone2}
                onChange={(e) => setPhone2(e.target.value)}
                placeholder="+234 800 000 0000"
                className="w-full rounded border rule bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-[var(--muted-custom)] mb-1">
                Marital Status
              </label>
              <select
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value)}
                className="w-full rounded border rule bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
              >
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-xs text-[var(--muted-custom)] mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full rounded border rule bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block font-mono text-xs text-[var(--muted-custom)] mb-1">
                Gender *
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded border rule bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-xs text-[var(--muted-custom)] mb-1">
                Disability / Physical Accommodations
              </label>
              <input
                type="text"
                value={disability}
                onChange={(e) => setDisability(e.target.value)}
                placeholder="State 'None' or describe accommodation"
                className="w-full rounded border rule bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
              />
            </div>
          </div>

          {/* Passport Photo Upload */}
          <div>
            <label className="block font-mono text-xs text-[var(--muted-custom)] mb-1">
              Applicant Passport Photograph (File Upload)
            </label>
            <div className="mt-1 flex items-center gap-4">
              <label className="btn-outline flex cursor-pointer items-center gap-2 rounded px-4 py-2 font-mono text-xs">
                <Upload className="h-4 w-4" />
                <span>{passportFile ? passportFile.name : "Select Passport Photo"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPassportFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-[var(--muted-custom)]">
                Accepted: JPG, PNG, WEBP (Clear white or light background)
              </span>
            </div>
          </div>
        </section>

        {/* 2. ORIGIN & RESIDENCE */}
        <section className="rounded-lg border rule bg-[var(--surface)] p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b rule pb-4">
            <MapPin className="h-5 w-5 brass-text shrink-0" />
            <div>
              <h2 className="font-display text-xl font-bold text-[var(--ink)]">
                2. Origin & Residential Address
              </h2>
              <p className="text-xs text-[var(--muted-custom)]">
                Hometown ancestry and current domestic residence in Nigeria or abroad.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block font-mono text-xs text-[var(--muted-custom)] mb-1">
                State of Origin *
              </label>
              <input
                type="text"
                required
                value={stateOfOrigin}
                onChange={(e) => setStateOfOrigin(e.target.value)}
                placeholder="e.g. Ogun State"
                className="w-full rounded border rule bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-[var(--muted-custom)] mb-1">
                LGA of Origin *
              </label>
              <input
                type="text"
                required
                value={lgaOfOrigin}
                onChange={(e) => setLgaOfOrigin(e.target.value)}
                placeholder="e.g. Abeokuta South"
                className="w-full rounded border rule bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block font-mono text-xs text-[var(--muted-custom)] mb-1">
                Current State of Residence *
              </label>
              <input
                type="text"
                required
                value={currentState}
                onChange={(e) => setCurrentState(e.target.value)}
                placeholder="e.g. FCT Abuja"
                className="w-full rounded border rule bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-[var(--muted-custom)] mb-1">
                Current LGA of Residence *
              </label>
              <input
                type="text"
                required
                value={currentLga}
                onChange={(e) => setCurrentLga(e.target.value)}
                placeholder="e.g. Kuje Area Council"
                className="w-full rounded border rule bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-[var(--muted-custom)] mb-1">
                Country *
              </label>
              <input
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Nigeria"
                className="w-full rounded border rule bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs text-[var(--muted-custom)] mb-1">
              Current Residence Street Address *
            </label>
            <textarea
              required
              rows={2}
              value={currentAddress}
              onChange={(e) => setCurrentAddress(e.target.value)}
              placeholder="e.g. Plot 14, Dunamis Avenue, Behind Arena, Kuje Abuja"
              className="w-full rounded border rule bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
            />
          </div>
        </section>

        {/* 3. TWO GUARANTORS */}
        <section className="rounded-lg border rule bg-[var(--surface)] p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b rule pb-4">
            <Users className="h-5 w-5 brass-text shrink-0" />
            <div>
              <h2 className="font-display text-xl font-bold text-[var(--ink)]">
                3. Guarantors (Two Required)
              </h2>
              <p className="text-xs text-[var(--muted-custom)]">
                Provide credentials, contact information, and passport photographs for two professional or civic guarantors.
              </p>
            </div>
          </div>

          {/* Guarantor 1 */}
          <div className="rounded border rule bg-[var(--surface-2)] p-5 space-y-4">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--brass)]">
              Guarantor 1
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-mono text-[11px] text-[var(--muted-custom)] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={g1Name}
                  onChange={(e) => setG1Name(e.target.value)}
                  placeholder="Guarantor full name"
                  className="w-full rounded border rule bg-[var(--bg)] px-3 py-1.5 text-xs text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                />
              </div>
              <div>
                <label className="block font-mono text-[11px] text-[var(--muted-custom)] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={g1Email}
                  onChange={(e) => setG1Email(e.target.value)}
                  placeholder="guarantor1@example.com"
                  className="w-full rounded border rule bg-[var(--bg)] px-3 py-1.5 text-xs text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                />
              </div>
              <div>
                <label className="block font-mono text-[11px] text-[var(--muted-custom)] mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={g1Phone}
                  onChange={(e) => setG1Phone(e.target.value)}
                  placeholder="+234..."
                  className="w-full rounded border rule bg-[var(--bg)] px-3 py-1.5 text-xs text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[11px] text-[var(--muted-custom)] mb-1">
                  Residential / Office Address *
                </label>
                <input
                  type="text"
                  required
                  value={g1Address}
                  onChange={(e) => setG1Address(e.target.value)}
                  placeholder="Address of guarantor 1"
                  className="w-full rounded border rule bg-[var(--bg)] px-3 py-1.5 text-xs text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                />
              </div>
              <div>
                <label className="block font-mono text-[11px] text-[var(--muted-custom)] mb-1">
                  Passport Photograph
                </label>
                <label className="btn-outline flex cursor-pointer items-center gap-2 rounded px-3 py-1.5 font-mono text-xs">
                  <Upload className="h-3.5 w-3.5" />
                  <span>{g1Passport ? g1Passport.name : "Upload Guarantor 1 Photo"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setG1Passport(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Guarantor 2 */}
          <div className="rounded border rule bg-[var(--surface-2)] p-5 space-y-4">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--brass)]">
              Guarantor 2
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-mono text-[11px] text-[var(--muted-custom)] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={g2Name}
                  onChange={(e) => setG2Name(e.target.value)}
                  placeholder="Guarantor full name"
                  className="w-full rounded border rule bg-[var(--bg)] px-3 py-1.5 text-xs text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                />
              </div>
              <div>
                <label className="block font-mono text-[11px] text-[var(--muted-custom)] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={g2Email}
                  onChange={(e) => setG2Email(e.target.value)}
                  placeholder="guarantor2@example.com"
                  className="w-full rounded border rule bg-[var(--bg)] px-3 py-1.5 text-xs text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                />
              </div>
              <div>
                <label className="block font-mono text-[11px] text-[var(--muted-custom)] mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={g2Phone}
                  onChange={(e) => setG2Phone(e.target.value)}
                  placeholder="+234..."
                  className="w-full rounded border rule bg-[var(--bg)] px-3 py-1.5 text-xs text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[11px] text-[var(--muted-custom)] mb-1">
                  Residential / Office Address *
                </label>
                <input
                  type="text"
                  required
                  value={g2Address}
                  onChange={(e) => setG2Address(e.target.value)}
                  placeholder="Address of guarantor 2"
                  className="w-full rounded border rule bg-[var(--bg)] px-3 py-1.5 text-xs text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                />
              </div>
              <div>
                <label className="block font-mono text-[11px] text-[var(--muted-custom)] mb-1">
                  Passport Photograph
                </label>
                <label className="btn-outline flex cursor-pointer items-center gap-2 rounded px-3 py-1.5 font-mono text-xs">
                  <Upload className="h-3.5 w-3.5" />
                  <span>{g2Passport ? g2Passport.name : "Upload Guarantor 2 Photo"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setG2Passport(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* 4. IDENTIFICATION & NIN */}
        <section className="rounded-lg border rule bg-[var(--surface)] p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b rule pb-4">
            <CreditCard className="h-5 w-5 brass-text shrink-0" />
            <div>
              <h2 className="font-display text-xl font-bold text-[var(--ink)]">
                4. Identity & Verification Documents
              </h2>
              <p className="text-xs text-[var(--muted-custom)]">
                National Identity Number (NIN) and government ID card front and back scans.
              </p>
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs text-[var(--muted-custom)] mb-1">
              National Identification Number (NIN) *
            </label>
            <input
              type="text"
              required
              value={nin}
              onChange={(e) => setNin(e.target.value)}
              placeholder="11-digit NIN"
              className="w-full sm:max-w-md rounded border rule bg-[var(--bg)] px-3 py-2 font-mono text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)] tracking-wider"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded border rule bg-[var(--surface-2)] p-4">
              <label className="block font-mono text-xs font-semibold text-[var(--ink)] mb-2">
                ID Document (Front Scan / Image)
              </label>
              <label className="btn-outline flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-xs font-mono">
                <Upload className="h-4 w-4" />
                <span>{idFrontFile ? idFrontFile.name : "Upload Front Image"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setIdFrontFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>

            <div className="rounded border rule bg-[var(--surface-2)] p-4">
              <label className="block font-mono text-xs font-semibold text-[var(--ink)] mb-2">
                ID Document (Back Scan / Image)
              </label>
              <label className="btn-outline flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-xs font-mono">
                <Upload className="h-4 w-4" />
                <span>{idBackFile ? idBackFile.name : "Upload Back Image"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setIdBackFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </section>

        {/* 5. INSTITUTIONAL PLACEMENT */}
        <section className="rounded-lg border rule bg-[var(--surface)] p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b rule pb-4">
            <Briefcase className="h-5 w-5 brass-text shrink-0" />
            <div>
              <h2 className="font-display text-xl font-bold text-[var(--ink)]">
                5. Institutional Placement & Workstation
              </h2>
              <p className="text-xs text-[var(--muted-custom)]">
                Designation, operating department, company email, and workstation.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block font-mono text-xs text-[var(--muted-custom)] mb-1">
                Designation / Job Title *
              </label>
              <input
                type="text"
                required
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Senior Backend Engineer"
                className="w-full rounded border rule bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-[var(--muted-custom)] mb-1">
                Department *
              </label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Engineering & Architecture"
                className="w-full rounded border rule bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-[var(--muted-custom)] mb-1">
                Workstation / Hub Location *
              </label>
              <input
                type="text"
                required
                value={workstation}
                onChange={(e) => setWorkstation(e.target.value)}
                placeholder="e.g. Abuja Hub / Remote"
                className="w-full rounded border rule bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block font-mono text-xs text-[var(--muted-custom)] mb-1">
                Company Email (Optional)
              </label>
              <input
                type="email"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                placeholder="name@tr3-g.com.ng"
                className="w-full rounded border rule bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-[var(--muted-custom)] mb-1">
                Reference / Recommender
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Name of referee or department lead"
                className="w-full rounded border rule bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 border-t rule pt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={idCard}
                onChange={(e) => setIdCard(e.target.checked)}
                className="h-4 w-4 rounded accent-[var(--brass)]"
              />
              <span className="font-mono text-xs text-[var(--ink)]">
                Issue Physical TR3-G Smart ID Card upon verification
              </span>
            </label>
          </div>
        </section>

        {/* Submit Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-lg border rule-strong bg-[var(--surface-2)] p-6">
          <div>
            <p className="font-mono text-xs font-semibold uppercase text-[var(--ink)]">
              Automated Staff UID Generation
            </p>
            <p className="text-xs text-[var(--muted-custom)]">
              Your official TR3-G Staff UID (TR3G-STF-XXXXXX) will be generated and issued upon saving.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-brass inline-flex items-center justify-center gap-2 rounded px-8 py-3 text-sm font-semibold shadow disabled:opacity-50"
          >
            {submitting ? (
              <span>Enrolling BioData...</span>
            ) : (
              <>
                <span>Submit Official BioData</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
