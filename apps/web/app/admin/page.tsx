"use client"

import * as React from "react"
import Link from "next/link"
import {
  Briefcase,
  Cpu,
  Users,
  Handshake,
  GraduationCap,
  FileText,
  MessageSquare,
  ShieldCheck,
  ArrowUpRight,
  Plus,
} from "lucide-react"
import { useAdminAuth } from "@/hooks/use-admin-auth"

export default function AdminDashboardPage() {
  const { user, canCreate } = useAdminAuth()
  const [stats, setStats] = React.useState({
    services: 0,
    solutions: 0,
    team: 0,
    partners: 0,
    careers: 0,
    applications: 0,
    contacts: 0,
    staff: 0,
  })
  const [recentApps, setRecentApps] = React.useState<any[]>([])
  const [recentContacts, setRecentContacts] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadStats() {
      try {
        const [
          servicesRes,
          solutionsRes,
          teamRes,
          partnersRes,
          careersRes,
          appsRes,
          contactsRes,
          staffRes,
        ] = await Promise.all([
          fetch("/api/admin/content/service"),
          fetch("/api/admin/content/solution"),
          fetch("/api/admin/content/team"),
          fetch("/api/admin/content/partner"),
          fetch("/api/admin/content/career"),
          fetch("/api/admin/applications"),
          fetch("/api/admin/contacts"),
          fetch("/api/admin/staff"),
        ])

        const [
          services,
          solutions,
          team,
          partners,
          careers,
          apps,
          contacts,
          staff,
        ] = await Promise.all([
          servicesRes.ok ? servicesRes.json() : [],
          solutionsRes.ok ? solutionsRes.json() : [],
          teamRes.ok ? teamRes.json() : [],
          partnersRes.ok ? partnersRes.json() : [],
          careersRes.ok ? careersRes.json() : [],
          appsRes.ok ? appsRes.json() : [],
          contactsRes.ok ? contactsRes.json() : [],
          staffRes.ok ? staffRes.json() : [],
        ])

        setStats({
          services: services.length || 0,
          solutions: solutions.length || 0,
          team: team.length || 0,
          partners: partners.length || 0,
          careers: careers.length || 0,
          applications: apps.length || 0,
          contacts: contacts.length || 0,
          staff: staff.length || 0,
        })

        setRecentApps(apps.slice(0, 5))
        setRecentContacts(contacts.slice(0, 5))
      } catch (err) {
        console.error("Dashboard error:", err)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const cards = [
    { label: "Core Services", count: stats.services, href: "/admin/services", icon: Briefcase },
    { label: "Deployed Solutions", count: stats.solutions, href: "/admin/solutions", icon: Cpu },
    { label: "Team Members", count: stats.team, href: "/admin/team", icon: Users },
    { label: "Alliances / Partners", count: stats.partners, href: "/admin/partners", icon: Handshake },
    { label: "Career Positions", count: stats.careers, href: "/admin/careers", icon: GraduationCap },
    { label: "Recruitment Applications", count: stats.applications, href: "/admin/applications", icon: FileText },
    { label: "Contact Enquiries", count: stats.contacts, href: "/admin/contacts", icon: MessageSquare },
    { label: "Staff Accounts", count: stats.staff, href: "/admin/staff", icon: ShieldCheck },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-lg border rule-strong bg-[var(--surface)] p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-wide brass-text">
              OPERATIONAL OVERVIEW
            </p>
            <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold">
              Welcome back, {user?.full_name || user?.username}
            </h1>
            <p className="mt-1 text-sm text-[var(--muted-custom)]">
              TR3-G Control Plane running NeDB embedded data store with Argon2 security.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {canCreate && (
              <Link
                href="/admin/services"
                className="btn-brass inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-semibold"
              >
                <Plus className="h-4 w-4" />
                <span>Add Content</span>
              </Link>
            )}
            <Link
              href="/admin/staff"
              className="inline-flex items-center gap-1.5 rounded-md border rule px-4 py-2 text-xs font-mono text-[var(--ink)] hover:border-[var(--brass)]"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Manage Staff</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.label}
              href={card.href}
              className="group rounded-lg border rule bg-[var(--surface)] p-5 transition-all hover:border-[var(--brass)] hover:bg-[var(--surface-2)]"
            >
              <div className="flex items-center justify-between text-[var(--muted-custom)]">
                <Icon className="h-5 w-5 text-[var(--brass)]" />
                <ArrowUpRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div className="mt-4">
                <span className="font-display text-3xl font-bold tracking-tight text-[var(--ink)]">
                  {loading ? "..." : card.count}
                </span>
                <p className="mt-1 font-mono text-xs text-[var(--muted-custom)] truncate">
                  {card.label}
                </p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Two-column Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Applications */}
        <div className="rounded-lg border rule bg-[var(--surface)] p-6">
          <div className="flex items-center justify-between border-b rule pb-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-wide teal-text">Recruitment</p>
              <h2 className="font-display text-xl font-bold">Recent Applications</h2>
            </div>
            <Link
              href="/admin/applications"
              className="font-mono text-xs brass-text hover:underline"
            >
              View all →
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {recentApps.length === 0 ? (
              <p className="py-6 text-center font-mono text-xs text-[var(--muted-custom)]">
                {loading ? "Loading..." : "No applications received yet."}
              </p>
            ) : (
              recentApps.map((app) => (
                <div
                  key={app._id}
                  className="flex items-center justify-between rounded border rule p-3 text-xs"
                >
                  <div>
                    <span className="font-semibold text-[var(--ink)]">{app.full_name}</span>
                    <p className="font-mono text-[11px] text-[var(--muted-custom)]">
                      {app.career_title || "General Role"} · {app.email}
                    </p>
                  </div>
                  <span className="rounded bg-[var(--surface-2)] px-2 py-0.5 font-mono text-[10px] uppercase text-[var(--brass)]">
                    {app.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Inquiries */}
        <div className="rounded-lg border rule bg-[var(--surface)] p-6">
          <div className="flex items-center justify-between border-b rule pb-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-wide teal-text">Inquiries</p>
              <h2 className="font-display text-xl font-bold">Recent Contact Messages</h2>
            </div>
            <Link
              href="/admin/contacts"
              className="font-mono text-xs brass-text hover:underline"
            >
              View all →
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {recentContacts.length === 0 ? (
              <p className="py-6 text-center font-mono text-xs text-[var(--muted-custom)]">
                {loading ? "Loading..." : "No contact messages received yet."}
              </p>
            ) : (
              recentContacts.map((contact) => (
                <div
                  key={contact._id}
                  className="flex items-center justify-between rounded border rule p-3 text-xs"
                >
                  <div>
                    <span className="font-semibold text-[var(--ink)]">{contact.name}</span>
                    <p className="font-mono text-[11px] text-[var(--muted-custom)]">
                      {contact.organization || contact.topic || "Direct"} · {contact.email}
                    </p>
                  </div>
                  <span className="rounded bg-[var(--surface-2)] px-2 py-0.5 font-mono text-[10px] uppercase text-[var(--teal)]">
                    {contact.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
