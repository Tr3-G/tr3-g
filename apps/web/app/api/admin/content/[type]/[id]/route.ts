import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser, hasPermission } from "@/lib/auth"
import { updateContentItem, deleteContentItem } from "@/lib/db"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }
  if (!hasPermission(user, "update")) {
    return NextResponse.json({ error: "Permission denied: You do not have permission to update items" }, { status: 403 })
  }

  const { id } = await params
  try {
    const body = await request.json()
    const updated = await updateContentItem(id, body)
    if (!updated) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }
    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update item" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }
  if (!hasPermission(user, "delete")) {
    return NextResponse.json({ error: "Permission denied: You do not have permission to delete items" }, { status: 403 })
  }

  const { id } = await params
  try {
    const success = await deleteContentItem(id)
    if (!success) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete item" }, { status: 500 })
  }
}
