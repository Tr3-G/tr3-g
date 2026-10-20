import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import argon2 from "argon2"
import { getStaffByUsername, getStaffById, StaffPermissions } from "./db"

const JWT_SECRET = process.env.JWT_SECRET || "tr3g-innovations-secure-jwt-key-change-in-prod"
export const AUTH_COOKIE_NAME = "tr3g_admin"

export interface AuthUser {
  id: string
  username: string
  email: string
  full_name: string
  role: "admin" | "staff"
  permissions: StaffPermissions
}

export async function hashPassword(plainText: string): Promise<string> {
  return argon2.hash(plainText, {
    type: argon2.argon2id,
  })
}

export async function verifyPassword(hash: string, plainText: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plainText)
  } catch (err) {
    console.error("Argon2 verify error:", err)
    return false
  }
}

export function createSessionToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      permissions: user.permissions,
    },
    JWT_SECRET,
    { expiresIn: "12h" }
  )
}

export function verifySessionToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    if (!decoded || !decoded.username) return null
    return {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      full_name: decoded.full_name,
      role: decoded.role,
      permissions: decoded.permissions || {
        create: false,
        read: true,
        update: false,
        delete: false,
      },
    }
  } catch {
    return null
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value
    if (!token) return null
    return verifySessionToken(token)
  } catch {
    return null
  }
}

export async function authenticateStaff(
  username: string,
  plainPassword: string
): Promise<AuthUser | null> {
  let staff = await getStaffByUsername(username)
  if (!staff || !staff.active) return null

  const valid = await verifyPassword(staff.password_hash, plainPassword)
  if (!valid) return null

  return {
    id: staff._id as string,
    username: staff.username,
    email: staff.email,
    full_name: staff.full_name,
    role: staff.role,
    permissions: staff.permissions || {
      create: staff.role === "admin",
      read: true,
      update: staff.role === "admin",
      delete: staff.role === "admin",
    },
  }
}

export function hasPermission(
  user: AuthUser | null,
  action: keyof StaffPermissions
): boolean {
  if (!user) return false
  if (user.role === "admin") return true
  return Boolean(user.permissions?.[action])
}
