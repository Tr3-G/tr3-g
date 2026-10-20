import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser, hasPermission } from "@/lib/auth"
import { getStaffList, createStaffMember } from "@/lib/db"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }
  if (!hasPermission(user, "read")) {
    return NextResponse.json({ error: "Permission denied (read)" }, { status: 403 })
  }

  const staff = await getStaffList()
  return NextResponse.json(staff)
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }
  if (user.role !== "admin" && !hasPermission(user, "create")) {
    return NextResponse.json(
      { error: "Permission denied: Only administrators or authorized staff can create accounts" },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { username, email, full_name, password, role = "staff", permissions } = body || {}

    if (!username || !email || !password || !full_name) {
      return NextResponse.json(
        { error: "Username, email, full name and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      )
    }

    const newStaff = await createStaffMember({
      username,
      email,
      full_name,
      password,
      role: role === "admin" ? "admin" : "staff",
      permissions: {
        create: Boolean(permissions?.create),
        read: permissions?.read !== false,
        update: Boolean(permissions?.update),
        delete: Boolean(permissions?.delete),
      },
    })

    return NextResponse.json(newStaff, { status: 201 })
  } catch (error: any) {
    console.error("Staff creation error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create staff member" },
      { status: 400 }
    )
  }
}
