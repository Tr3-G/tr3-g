import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser, hasPermission } from "@/lib/auth"
import { getGalleryItemById, updateGalleryItem, deleteGalleryItem } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  const { id } = await params
  const item = await getGalleryItemById(id)
  if (!item) {
    return NextResponse.json({ error: "Gallery item not found" }, { status: 404 })
  }
  return NextResponse.json(item)
}

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
    const updates = await request.json()
    const updated = await updateGalleryItem(id, updates)
    if (!updated) {
      return NextResponse.json({ error: "Gallery item not found" }, { status: 404 })
    }
    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update gallery item" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return PATCH(request, { params })
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
    const success = await deleteGalleryItem(id)
    if (!success) {
      return NextResponse.json({ error: "Gallery item not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete gallery item" }, { status: 500 })
  }
}
