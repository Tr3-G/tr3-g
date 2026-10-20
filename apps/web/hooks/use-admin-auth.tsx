"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { useRouter, usePathname } from "next/navigation"

export interface AdminUser {
  id: string
  username: string
  email: string
  full_name: string
  role: "admin" | "staff"
  permissions: {
    create: boolean
    read: boolean
    update: boolean
    delete: boolean
  }
}

interface AdminAuthContextType {
  user: AdminUser | null
  loading: boolean
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  canCreate: boolean
  canRead: boolean
  canUpdate: boolean
  canDelete: boolean
  isAdmin: boolean
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  refreshUser: async () => {},
  canCreate: false,
  canRead: false,
  canUpdate: false,
  canDelete: false,
  isAdmin: false,
})

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/admin/me")
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        setUser(null)
        if (pathname !== "/admin/login") {
          router.push("/admin/login")
        }
      }
    } catch {
      setUser(null)
      if (pathname !== "/admin/login") {
        router.push("/admin/login")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (pathname === "/admin/login") {
      setLoading(false)
      return
    }
    refreshUser()
  }, [pathname])

  const logout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" })
    } finally {
      setUser(null)
      router.push("/admin/login")
    }
  }

  const isAdmin = user?.role === "admin"
  const canCreate = isAdmin || Boolean(user?.permissions?.create)
  const canRead = isAdmin || user?.permissions?.read !== false
  const canUpdate = isAdmin || Boolean(user?.permissions?.update)
  const canDelete = isAdmin || Boolean(user?.permissions?.delete)

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        loading,
        logout,
        refreshUser,
        canCreate,
        canRead,
        canUpdate,
        canDelete,
        isAdmin,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  return useContext(AdminAuthContext)
}
