import { Inter, Manrope, JetBrains_Mono } from "next/font/google"
import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@workspace/ui/lib/utils"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata = {
  title: "TR3-G Innovations Limited - Enterprise Software, Built Secure",
  description: "TR3-G Innovations Limited designs and builds custom high-performance digital ecosystems for enterprises and government institutions.",
  icons: {
    icon: "/img/tr3-g.webp",
    shortcut: "/img/tr3-g.webp",
    apple: "/img/tr3-g.webp",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        inter.variable,
        manrope.variable,
        jetbrainsMono.variable
      )}
    >
      <body className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
