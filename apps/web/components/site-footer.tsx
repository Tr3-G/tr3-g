import Link from "next/link"
import { Mail, Phone } from "lucide-react"

export function SiteFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-surface border-t rule-strong">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-5">
          {/* Col 1-2: Brand overview */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center">
              <img
                src="/img/tr3-g.webp"
                alt="TR3-G Innovations Limited"
                className="h-11 w-auto"
              />
            </Link>
            <p className="muted-text mt-4 max-w-xs text-sm leading-relaxed">
              Custom high-performance digital ecosystems for enterprises and government institutions — built secure, delivered reliably.
            </p>
            <p className="font-mono text-[11px] muted-text mt-6 uppercase tracking-wide">
              Abuja Operations Hub
            </p>
          </div>

          {/* Col 3: Ecosystem */}
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wide brass-text mb-4 font-semibold">
              Ecosystem
            </p>
            <ul className="space-y-3 text-sm muted-text font-sans">
              <li><Link href="/" className="hover:text-[var(--ink)] transition">Home interface</Link></li>
              <li><Link href="/services" className="hover:text-[var(--ink)] transition">Core services</Link></li>
              <li><Link href="/solutions" className="hover:text-[var(--ink)] transition">Digital solutions</Link></li>
              <li><Link href="/stack" className="hover:text-[var(--ink)] transition">Technology stack</Link></li>
              <li><Link href="/about" className="hover:text-[var(--ink)] transition">Identity story</Link></li>
            </ul>
          </div>

          {/* Col 4: Company */}
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wide brass-text mb-4 font-semibold">
              Company
            </p>
            <ul className="space-y-3 text-sm muted-text font-sans">
              <li><Link href="/team" className="hover:text-[var(--ink)] transition">Our team</Link></li>
              <li><Link href="/partners" className="hover:text-[var(--ink)] transition">Alliances</Link></li>
              <li><Link href="/contact" className="hover:text-[var(--ink)] transition">Contact channels</Link></li>
              <li><Link href="/careers" className="hover:text-[var(--ink)] transition">Career portals</Link></li>
              <li><Link href="/attendance" className="hover:text-[var(--ink)] transition">Staff Attendance</Link></li>
              <li><Link href="/reports/submit" className="hover:text-[var(--ink)] transition">Staff Reporting</Link></li>
            </ul>
          </div>

          {/* Col 5: Technical support */}
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wide brass-text mb-4 font-semibold">
              Technical support
            </p>
            <p className="text-sm muted-text leading-relaxed mb-4">
              Connect with our Abuja operations hub for SLA queries.
            </p>
            <ul className="space-y-3 text-sm font-mono">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 teal-text shrink-0" />
                <a href="mailto:info@tr3-g.com.ng" className="hover:text-[var(--ink)] transition muted-text">
                  info@tr3-g.com.ng
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 teal-text shrink-0" />
                <a href="tel:+2347048029218" className="hover:text-[var(--ink)] transition muted-text">
                  +234 704 8802 9218
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 border-t rule pt-8 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-[11px] muted-text uppercase tracking-wide">
          <p suppressHydrationWarning>© {currentYear} TR3-G Innovations Limited. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-[var(--ink)] transition cursor-pointer">Privacy policy</span>
            <span className="hover:text-[var(--ink)] transition cursor-pointer">Terms of service</span>
            <span className="hover:text-[var(--ink)] transition cursor-pointer">Security core</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
