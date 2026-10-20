import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser, hasPermission } from "@/lib/auth"
import { updateContactStatus, deleteContact } from "@/lib/db"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }
  if (!hasPermission(user, "update")) {
    return NextResponse.json({ error: "Permission denied (update)" }, { status: 403 })
  }

  const { id } = await params
  try {
    const { status } = await request.json()
    const success = await updateContactStatus(id, status)
    if (!success) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update status" }, { status: 500 })
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
  if (!hasPermission(user, "delete")) {
    return NextResponse.json({ error: "Permission denied (delete)" }, { status: 403 })
  }

  const { id } = await params
  try {
    const success = await deleteContact(id)
    if (!success) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete contact" }, { status: 500 })
  }
}
