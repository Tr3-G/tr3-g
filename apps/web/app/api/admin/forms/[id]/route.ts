import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser, hasPermission } from "@/lib/auth"
import { getRecruitmentFormById, updateRecruitmentForm, deleteRecruitmentForm } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }
  if (!hasPermission(user, "read")) {
    return NextResponse.json({ error: "Permission denied (read)" }, { status: 403 })
  }

  const { id } = await params
  const form = await getRecruitmentFormById(id)
  if (!form) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 })
  }
  return NextResponse.json(form)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }
  if (!hasPermission(user, "update")) {
    return NextResponse.json(
      { error: "Permission denied: You do not have permission to update recruitment forms" },
      { status: 403 }
    )
  }

  const { id } = await params
  try {
    const body = await request.json()
    const updated = await updateRecruitmentForm(id, body)
    if (!updated) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }
    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update recruitment form" },
      { status: 500 }
    )
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
    return NextResponse.json(
      { error: "Permission denied: You do not have permission to delete recruitment forms" },
      { status: 403 }
    )
  }

  const { id } = await params
  try {
    const success = await deleteRecruitmentForm(id)
    if (!success) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete recruitment form" },
      { status: 500 }
    )
  }
}
