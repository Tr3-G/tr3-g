import { NextRequest, NextResponse } from "next/server"
import { authenticateStaff, createSessionToken, AUTH_COOKIE_NAME } from "@/lib/auth"
import { logAudit } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body || {}

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      )
    }

    const user = await authenticateStaff(username, password)
    if (!user) {
      await logAudit({
        actor_name: username,
        action: "LOGIN_FAILED",
        resource: "auth",
        details: `Failed authentication attempt for username: ${username}`,
        status: "warning",
      }).catch(() => {})

      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      )
    }

    const token = createSessionToken(user)
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        permissions: user.permissions,
      },
    })

    await logAudit({
      actor_id: user.id,
      actor_name: user.full_name || user.username,
      actor_role: user.role || "admin",
      action: "LOGIN",
      resource: "auth",
      details: `Administrator ${user.username} logged into control plane.`,
      status: "success",
    }).catch(() => {})

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 12 * 60 * 60, // 12 hours
      path: "/",
    })

    return response
  } catch (error: any) {
    console.error("Login error:", error)
    return NextResponse.json({ error: error.message || "Login failed" }, { status: 500 })
  }
}
