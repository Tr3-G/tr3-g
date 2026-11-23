"use client"

import * as React from "react"
import {
  Mail,
  Send,
  User,
  Users,
  GraduationCap,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileText,
  RotateCcw,
} from "lucide-react"
import { useAdminAuth } from "@/hooks/use-admin-auth"

type RecipientType = "staff" | "applicant" | "contact" | "other"

interface StaffOption {
  _id: string
  full_name: string
  username: string
  email: string
  role: string
}

interface ApplicantOption {
  _id: string
  full_name: string
  email: string
  career_title?: string
}

interface ContactOption {
  _id: string
  name: string
  email: string
  topic?: string
}

const templates = [
  {
    name: "Interview Invitation",
    subject: "Invitation to Technical Interview — TR3-G Innovations Limited",
    body: `Thank you for your interest in joining TR3-G Innovations Limited.

Following a review of your application and technical materials, we would like to invite you for an interview with our engineering cohort.

Please reply to this email with your availability over the next three business days so we can schedule your session.

We look forward to speaking with you.`,
  },
  {
    name: "Application Status: Shortlisted",
    subject: "Application Update: Shortlisted for Next Phase — TR3-G Innovations Limited",
    body: `We are pleased to inform you that your application has advanced to our shortlisted candidate pool.

Our talent team is currently synchronizing schedules for role briefings and system assessments. We will share the details and calendar invite shortly.

Thank you for your continued patience and interest in building sovereign software with TR3-G.`,
  },
  {
    name: "General Inquiry Response",
    subject: "Regarding your inquiry to TR3-G Innovations Limited",
    body: `Thank you for reaching out to the TR3-G Innovations Limited operations hub.

We have received your message and would be pleased to schedule an introductory consultation regarding your technical requirements and platform deployment needs.

Please let us know your preferred meeting schedule or if you would like us to prepare an architecture overview for your team.`,
  },
  {
    name: "Staff Internal Notice",
    subject: "Internal Operations Notice — TR3-G Engineering Cohort",
    body: `Please take note of the upcoming infrastructure maintenance window and system compliance audit scheduled from the Abuja Operations Hub.

Ensure all pending code commits and deployment staging environments are synchronized with the primary master branch.

Contact the systems desk if you have any questions.`,
  },
]

export default function AdminMailPage() {
  const { user } = useAdminAuth()
  const [recipientType, setRecipientType] = React.useState<RecipientType>("staff")

  // Options state
  const [staffList, setStaffList] = React.useState<StaffOption[]>([])
  const [applicantList, setApplicantList] = React.useState<ApplicantOption[]>([])
  const [contactList, setContactList] = React.useState<ContactOption[]>([])
  const [loadingData, setLoadingData] = React.useState(false)

  // Selected item ID in dropdown
  const [selectedEntityId, setSelectedEntityId] = React.useState("")

  // Form inputs
  const [toEmail, setToEmail] = React.useState("")
  const [toName, setToName] = React.useState("")
  const [subject, setSubject] = React.useState("")
  const [message, setMessage] = React.useState("")

  // Status
  const [sending, setSending] = React.useState(false)
  const [error, setError] = React.useState("")
  const [success, setSuccess] = React.useState<{ messageId?: string; to: string } | null>(null)
  const [activeTab, setActiveTab] = React.useState<"compose" | "preview">("compose")

  // Fetch recipients data on mount
  React.useEffect(() => {
    async function fetchRecipients() {
      setLoadingData(true)
      try {
        const [staffRes, appsRes, contactsRes] = await Promise.all([
          fetch("/api/admin/staff"),
          fetch("/api/admin/applications"),
          fetch("/api/admin/contacts"),
        ])

        if (staffRes.ok) setStaffList(await staffRes.json())
        if (appsRes.ok) setApplicantList(await appsRes.json())
        if (contactsRes.ok) setContactList(await contactsRes.json())
      } catch (err) {
        console.error("Failed to load recipients:", err)
      } finally {
        setLoadingData(false)
      }
    }
    fetchRecipients()
  }, [])

  // When recipientType changes, update the selection
  React.useEffect(() => {
    setSelectedEntityId("")
    setError("")
    if (recipientType === "other") {
      setToEmail("")
      setToName("")
    }
  }, [recipientType])

  // Handle dropdown selection change
  const handleEntitySelect = (entityId: string) => {
    setSelectedEntityId(entityId)
    setError("")

    if (recipientType === "staff") {
      const selected = staffList.find((s) => s._id === entityId)
      if (selected) {
        setToEmail(selected.email)
        setToName(selected.full_name || selected.username)
      }
    } else if (recipientType === "applicant") {
      const selected = applicantList.find((a) => a._id === entityId)
      if (selected) {
        setToEmail(selected.email)
        setToName(selected.full_name)
      }
    } else if (recipientType === "contact") {
      const selected = contactList.find((c) => c._id === entityId)
      if (selected) {
        setToEmail(selected.email)
        setToName(selected.name)
      }
    }
  }

  const applyTemplate = (tpl: typeof templates[0]) => {
    setSubject(tpl.subject)
    setMessage(tpl.body)
  }

  const handleSendMail = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(null)

    if (!toEmail.trim() || !toEmail.includes("@")) {
      setError("Please provide a valid recipient email address.")
      return
    }

    if (!subject.trim()) {
      setError("Please provide an email subject.")
      return
    }

    if (!message.trim()) {
      setError("Please provide the email message body.")
      return
    }

    setSending(true)

    try {
      const res = await fetch("/api/admin/mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail: toEmail.trim(),
          toName: toName.trim() || undefined,
          subject: subject.trim(),
          message: message.trim(),
          category: recipientType,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to dispatch email")
      }

      setSuccess({
        messageId: data.messageId,
        to: toEmail.trim(),
      })

      // Reset form fields
      setMessage("")
      setSubject("")
      setSelectedEntityId("")
      if (recipientType === "other") {
        setToEmail("")
        setToName("")
      }
    } catch (err: any) {
      setError(err.message || "Email dispatch failed")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b rule pb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide teal-text font-semibold">
            COMMUNICATIONS ENGINE
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink)]">
            Mail Dispatcher
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-custom)]">
            Send official emails directly through Brevo to staff members, recruitment candidates, inquiries, or external addresses.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex rounded border rule p-1 bg-[var(--surface-2)] font-mono text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("compose")}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === "compose"
                ? "bg-[var(--surface)] text-[var(--ink)] font-semibold shadow-sm"
                : "text-[var(--muted-custom)] hover:text-[var(--ink)]"
            }`}
          >
            Compose Form
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === "preview"
                ? "bg-[var(--surface)] text-[var(--ink)] font-semibold shadow-sm"
                : "text-[var(--muted-custom)] hover:text-[var(--ink)]"
            }`}
          >
            Email Preview
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Dispatch Error</p>
            <p className="text-xs leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Email successfully dispatched via Brevo!</p>
            <p className="font-mono text-xs text-emerald-300">
              Delivered to: <strong>{success.to}</strong>
              {success.messageId && ` (Message ID: ${success.messageId})`}
            </p>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === "compose" ? (
            <form onSubmit={handleSendMail} className="rounded-lg border rule bg-[var(--surface)] p-6 space-y-5">
              {/* Recipient Type Select */}
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[var(--muted-custom)] mb-1.5">
                  Send To (Recipient Category) *
                </label>
                <div className="relative">
                  <select
                    value={recipientType}
                    onChange={(e) => setRecipientType(e.target.value as RecipientType)}
                    className="w-full rounded border rule bg-[var(--bg)] px-3 py-2.5 font-mono text-xs text-[var(--ink)] outline-none focus:border-[var(--brass)] cursor-pointer"
                  >
                    <option value="staff">Staff (Select from active staff cohort)</option>
                    <option value="applicant">Applicant (Select from recruitment applications)</option>
                    <option value="contact">Contact (Select from incoming contact messages)</option>
                    <option value="other">Other / External (Enter custom email address)</option>
                  </select>
                </div>
              </div>

              {/* Conditional Recipient Selector */}
              {recipientType === "staff" && (
                <div className="space-y-1.5 rounded border border-blue-500/20 bg-blue-500/5 p-4">
                  <label className="flex items-center gap-2 font-mono text-xs font-semibold text-blue-400">
                    <Users className="h-4 w-4" />
                    <span>Select Staff Member *</span>
                  </label>
                  {loadingData ? (
                    <p className="font-mono text-xs text-[var(--muted-custom)]">Loading staff list...</p>
                  ) : staffList.length === 0 ? (
                    <p className="text-xs text-[var(--muted-custom)]">No staff members found.</p>
                  ) : (
                    <select
                      value={selectedEntityId}
                      required
                      onChange={(e) => handleEntitySelect(e.target.value)}
                      className="w-full rounded border rule bg-[var(--bg)] px-3 py-2 font-mono text-xs text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                    >
                      <option value="">-- Choose a staff member --</option>
                      {staffList.map((staff) => (
                        <option key={staff._id} value={staff._id}>
                          {staff.full_name || staff.username} — {staff.email} ({staff.role.toUpperCase()})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {recipientType === "applicant" && (
                <div className="space-y-1.5 rounded border border-teal-500/20 bg-teal-500/5 p-4">
                  <label className="flex items-center gap-2 font-mono text-xs font-semibold teal-text">
                    <GraduationCap className="h-4 w-4" />
                    <span>Select Candidate / Applicant *</span>
                  </label>
                  {loadingData ? (
                    <p className="font-mono text-xs text-[var(--muted-custom)]">Loading applications...</p>
                  ) : applicantList.length === 0 ? (
                    <p className="text-xs text-[var(--muted-custom)]">No applicant submissions found.</p>
                  ) : (
                    <select
                      value={selectedEntityId}
                      required
                      onChange={(e) => handleEntitySelect(e.target.value)}
                      className="w-full rounded border rule bg-[var(--bg)] px-3 py-2 font-mono text-xs text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                    >
                      <option value="">-- Choose an applicant --</option>
                      {applicantList.map((app) => (
                        <option key={app._id} value={app._id}>
                          {app.full_name} — {app.email} ({app.career_title || "General Application"})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {recipientType === "contact" && (
                <div className="space-y-1.5 rounded border border-purple-500/20 bg-purple-500/5 p-4">
                  <label className="flex items-center gap-2 font-mono text-xs font-semibold text-purple-400">
                    <MessageSquare className="h-4 w-4" />
                    <span>Select Contact Inquirer *</span>
                  </label>
                  {loadingData ? (
                    <p className="font-mono text-xs text-[var(--muted-custom)]">Loading contact inquiries...</p>
                  ) : contactList.length === 0 ? (
                    <p className="text-xs text-[var(--muted-custom)]">No contact messages found.</p>
                  ) : (
                    <select
                      value={selectedEntityId}
                      required
                      onChange={(e) => handleEntitySelect(e.target.value)}
                      className="w-full rounded border rule bg-[var(--bg)] px-3 py-2 font-mono text-xs text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                    >
                      <option value="">-- Choose a contact entry --</option>
                      {contactList.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name} — {c.email} ({c.topic || "Inquiry"})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* If "other" or to display/edit the recipient details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-[var(--muted-custom)] mb-1">
                    Recipient Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={toEmail}
                    onChange={(e) => setToEmail(e.target.value)}
                    placeholder="candidate@example.com"
                    className="w-full rounded border rule bg-[var(--bg)] px-3 py-2 font-mono text-xs text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-[var(--muted-custom)] mb-1">
                    Recipient Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={toName}
                    onChange={(e) => setToName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full rounded border rule bg-[var(--bg)] px-3 py-2 text-xs text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[var(--muted-custom)] mb-1">
                  Email Subject *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Invitation to Technical Assessment"
                  className="w-full rounded border rule bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)] font-semibold"
                />
              </div>

              {/* Message Body */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-mono text-xs uppercase tracking-wider text-[var(--muted-custom)]">
                    Message Body *
                  </label>
                  <span className="font-mono text-[11px] text-[var(--muted-custom)]">
                    Plain text with auto-formatted paragraphs
                  </span>
                </div>
                <textarea
                  required
                  rows={10}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message here..."
                  className="w-full rounded border rule bg-[var(--bg)] p-3 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)] font-sans leading-relaxed"
                />
              </div>

              {/* Send Button */}
              <div className="pt-2 flex items-center justify-between">
                <span className="font-mono text-[11px] text-[var(--muted-custom)]">
                  Dispatched from: <strong className="text-[var(--brass)]">Brevo SMTP Engine</strong>
                </span>
                <button
                  type="submit"
                  disabled={sending}
                  className="btn-brass inline-flex items-center gap-2 rounded px-6 py-2.5 text-xs font-semibold shadow disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>{sending ? "Transmitting Email..." : "Send Email via Brevo"}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Live Email Preview */
            <div className="rounded-lg border rule bg-[#0B192C] p-6 text-[#E1E9F1]">
              <div className="border border-[rgba(63,122,34,0.4)] rounded-lg bg-[#0E243A] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-[#062950] to-[#0E243A] border-b border-[rgba(63,122,34,0.3)] flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">
                      TR3-G <span className="text-xs uppercase text-[#3F7A22] font-semibold tracking-wider ml-1">Innovations</span>
                    </h2>
                    <p className="font-mono text-[10px] uppercase text-[#7CA1BF] mt-1 tracking-wider">
                      Official Dispatch
                    </p>
                  </div>
                  <span className="font-mono text-[10px] text-[#529E2C] uppercase border border-[#3F7A22] bg-[rgba(63,122,34,0.2)] px-2 py-0.5 rounded">
                    TRANSMISSION
                  </span>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                  <div className="border-b border-zinc-800 pb-3 font-mono text-xs text-[#7CA1BF]">
                    <p>To: <span className="text-white">{toName || "Recipient"} &lt;{toEmail || "recipient@example.com"}&gt;</span></p>
                    <p className="mt-1">Subject: <span className="text-white font-semibold">{subject || "No Subject"}</span></p>
                  </div>

                  {toName && (
                    <p className="text-sm font-semibold text-white">
                      Dear <strong>{toName}</strong>,
                    </p>
                  )}

                  <div className="text-sm text-[#C2D3E4] leading-relaxed whitespace-pre-wrap">
                    {message || (
                      <span className="text-zinc-500 italic">
                        Message content will appear here once typed in the compose form...
                      </span>
                    )}
                  </div>

                  <div className="border-t border-[rgba(63,122,34,0.2)] pt-5 mt-6">
                    <p className="text-xs font-semibold text-white">The TR3-G Operations & Leadership Team</p>
                    <p className="font-mono text-[11px] text-[#7CA1BF]">Abuja Operations Hub • TR3-G Innovations Limited</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-[#061F38] border-t border-[rgba(63,122,34,0.2)] text-center font-mono text-[10px] text-[#54697F]">
                  <p>AA2 Behind Arena Off Dunamis Church, Kuje Abuja, Nigeria</p>
                  <p className="mt-1">© {new Date().getFullYear()} TR3-G Innovations Limited. Enterprise software, built secure.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Templates & Tips */}
        <div className="space-y-6">
          {/* Quick Templates */}
          <div className="rounded-lg border rule bg-[var(--surface)] p-5">
            <h3 className="font-mono text-xs uppercase tracking-wide teal-text font-semibold flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4" /> Template Presets
            </h3>
            <p className="text-xs text-[var(--muted-custom)] mb-4">
              Click any preset to prefill the subject and body with official TR3-G wording:
            </p>

            <div className="space-y-2.5">
              {templates.map((tpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyTemplate(tpl)}
                  className="w-full text-left rounded border rule bg-[var(--surface-2)] p-3 hover:border-[var(--brass)] transition-colors group"
                >
                  <p className="font-display text-xs font-bold text-[var(--ink)] group-hover:text-[var(--brass)] transition-colors">
                    {tpl.name}
                  </p>
                  <p className="font-mono text-[10px] text-[var(--muted-custom)] truncate mt-1">
                    {tpl.subject}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="rounded-lg border rule bg-[var(--surface-2)] p-5 space-y-3 font-mono text-xs">
            <h4 className="font-bold uppercase text-[var(--ink)] flex items-center gap-2">
              <Mail className="h-4 w-4 brass-text" /> Brevo Integration
            </h4>
            <p className="text-[var(--muted-custom)] text-[11px] leading-relaxed">
              Emails are sent via the transactional Brevo SMTP REST endpoint using the sender configured in your environment variables.
            </p>
            <div className="rounded border rule bg-[var(--bg)] p-2.5 space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span className="text-[var(--muted-custom)]">BREVO_SENDER_NAME:</span>
                <span className="text-[var(--brass)]">TR3-G Innovations</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted-custom)]">BREVO_SENDER_EMAIL:</span>
                <span className="teal-text">careers@tr3-g.com.ng</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
