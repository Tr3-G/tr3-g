import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser, hasPermission } from "@/lib/auth"
import { updateStaffMember, deleteStaffMember, getStaffById } from "@/lib/db"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  const { id } = await params

  // A staff member can only update themselves or an admin can update anyone
  if (user.role !== "admin" && user.id !== id && !hasPermission(user, "update")) {
    return NextResponse.json(
      { error: "Permission denied: You do not have permission to update staff accounts" },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    // Non-admins cannot elevate role or edit permissions
    const updatePayload: any = {
      email: body.email,
      full_name: body.full_name,
      active: body.active,
    }

    if (body.password && body.password.trim()) {
      if (body.password.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
      }
      updatePayload.password = body.password.trim()
    }

    if (user.role === "admin") {
      if (body.role) updatePayload.role = body.role
      if (body.permissions) updatePayload.permissions = body.permissions
    }

    const updated = await updateStaffMember(id, updatePayload)
    if (!updated) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update staff member" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  if (user.role !== "admin" && !hasPermission(user, "delete")) {
    return NextResponse.json(
      { error: "Permission denied: Only administrators can delete staff accounts" },
      { status: 403 }
    )
  }

  const { id } = await params
  if (user.id === id) {
    return NextResponse.json(
      { error: "Action prohibited: You cannot delete your own account" },
      { status: 400 }
    )
  }

  try {
    const target = await getStaffById(id)
    if (!target) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 })
    }

    const success = await deleteStaffMember(id)
    return NextResponse.json({ success })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete staff member" }, { status: 500 })
  }
}
