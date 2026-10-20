"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Briefcase,
  Cpu,
  Users,
  Handshake,
  GraduationCap,
  FileText,
  MessageSquare,
  ShieldCheck,
  ClipboardList,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react"
import { AdminAuthProvider, useAdminAuth } from "@/hooks/use-admin-auth"
import { useTheme } from "next-themes"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/services", label: "Services", icon: Briefcase },
  { href: "/admin/solutions", label: "Solutions", icon: Cpu },
  { href: "/admin/team", label: "Team", icon: Users },
  { href: "/admin/partners", label: "Partners", icon: Handshake },
  { href: "/admin/careers", label: "Careers", icon: GraduationCap },
  { href: "/admin/recruitment-forms", label: "Recruitment Forms", icon: ClipboardList },
  { href: "/admin/applications", label: "Applications", icon: FileText },
  { href: "/admin/contacts", label: "Contact Messages", icon: MessageSquare },
  { href: "/admin/staff", label: "Staff Management", icon: ShieldCheck },
]

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, loading, logout } = useAdminAuth()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[var(--bg)] text-sm font-mono text-[var(--muted-custom)]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--brass)] border-t-transparent" />
          <span>Authenticating control plane session...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      {/* Sidebar for Desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r rule bg-[var(--surface)] lg:flex">
        <div className="flex h-16 items-center border-b rule px-6">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="font-display text-lg font-bold tracking-tight text-[var(--ink)]">TR3-G</span>
            <span className="rounded bg-[var(--brass)]/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--brass)] border border-[var(--brass)]/30">
              CONTROL PLANE
            </span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-4 font-mono text-xs">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors ${
                  isActive
                    ? "bg-[var(--brass)]/20 font-semibold text-[var(--brass)] border border-[var(--brass)]/40"
                    : "text-[var(--muted-custom)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="border-t rule p-4">
          <div className="rounded-md bg-[var(--surface-2)] p-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[var(--ink)]">
                {user.full_name || user.username}
              </span>
              <span className="rounded bg-[var(--brass)]/20 px-1.5 py-0.5 font-mono text-[10px] uppercase text-[var(--brass)]">
                {user.role}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1 font-mono text-[9px]">
              <span className={`px-1 py-0.5 rounded ${user.role === 'admin' || user.permissions.create ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>C</span>
              <span className={`px-1 py-0.5 rounded ${user.role === 'admin' || user.permissions.read ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-800 text-zinc-500'}`}>R</span>
              <span className={`px-1 py-0.5 rounded ${user.role === 'admin' || user.permissions.update ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-800 text-zinc-500'}`}>U</span>
              <span className={`px-1 py-0.5 rounded ${user.role === 'admin' || user.permissions.delete ? 'bg-red-500/20 text-red-400' : 'bg-zinc-800 text-zinc-500'}`}>D</span>
              <span className="text-[var(--muted-custom)] ml-1">permissions</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b rule bg-[var(--bg)]/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded p-1.5 text-[var(--muted-custom)] hover:bg-[var(--surface)] lg:hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="font-display font-medium text-[var(--ink)] sm:text-lg">
              {navItems.find((i) =>
                i.exact ? pathname === i.href : pathname.startsWith(i.href)
              )?.label || "Administration"}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="rounded border rule p-2 text-[var(--ink)] hover:bg-[var(--surface)] transition-colors"
              title="Toggle theme"
            >
              {mounted ? (
                resolvedTheme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )
              ) : (
                <span className="h-4 w-4" aria-hidden="true" />
              )}
            </button>

            <Link
              href="/"
              target="_blank"
              className="hidden items-center gap-1.5 rounded border rule px-3 py-1.5 font-mono text-xs text-[var(--ink)] hover:border-[var(--brass)] hover:text-[var(--brass)] sm:inline-flex"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>View Website</span>
            </Link>

            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 rounded border rule px-3 py-1.5 font-mono text-xs text-red-400 hover:border-red-500 hover:bg-red-500/10"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="border-b rule bg-[var(--surface)] p-4 lg:hidden">
            <nav className="space-y-1 font-mono text-xs">
              {navItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href)
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors ${
                      isActive
                        ? "bg-[var(--brass)]/20 font-semibold text-[var(--brass)] border border-[var(--brass)]/40"
                        : "text-[var(--muted-custom)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        )}

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname === "/admin/login") {
    return <AdminAuthProvider>{children}</AdminAuthProvider>
  }

  return (
    <AdminAuthProvider>
      <AdminShell>{children}</AdminShell>
    </AdminAuthProvider>
  )
}
