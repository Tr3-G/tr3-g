"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowUpRight, Menu, X, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/solutions", label: "Solutions" },
  { href: "/stack", label: "Stack" },
  { href: "/about", label: "About" },
  { href: "/team", label: "Team" },
  { href: "/partners", label: "Partners" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="site-header-bg sticky top-0 z-50 border-b rule">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <img
            src="/img/tr3-g.webp"
            alt="TR3-G Innovations Limited"
            className="h-9 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 font-mono text-[13px] uppercase tracking-wide md:flex lg:gap-8">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${isActive ? "active font-semibold text-[var(--brass)]" : "text-[var(--ink)] hover:text-[var(--brass)]"}`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Right CTA & Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="theme-toggle flex h-10 w-10 shrink-0 items-center justify-center rounded-sm transition-colors"
            aria-label="Toggle between light and dark theme"
          >
            {mounted ? (
              resolvedTheme === "dark" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )
            ) : (
              <span className="h-4 w-4" aria-hidden="true" />
            )}
          </button>

          <Link
            href="/contact"
            className="btn-brass hidden items-center gap-2 rounded-sm px-5 py-2.5 text-sm md:inline-flex"
          >
            <span>Start a project</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 md:hidden text-[var(--ink)]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <nav className="border-t rule bg-surface px-6 pb-6 pt-2 font-mono text-sm uppercase tracking-wide md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block border-b rule py-3 nav-link text-[var(--ink)]"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="btn-brass mt-4 inline-flex w-full items-center justify-center gap-2 rounded-sm px-5 py-2.5 text-sm normal-case font-semibold"
          >
            <span>Start a project</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </nav>
      )}
    </header>
  )
}
