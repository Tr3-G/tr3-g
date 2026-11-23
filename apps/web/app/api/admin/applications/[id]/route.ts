import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser, hasPermission } from "@/lib/auth"
import { getApplicationById, updateApplicationStatus, deleteApplication } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  const { id } = await params
  try {
    const app = await getApplicationById(id)
    if (!app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }
    return NextResponse.json(app)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load application" }, { status: 500 })
  }
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
    const { status } = await request.json()
    const success = await updateApplicationStatus(id, status)
    if (!success) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
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
    const success = await deleteApplication(id)
    if (!success) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete application" }, { status: 500 })
  }
}
