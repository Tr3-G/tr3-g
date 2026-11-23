import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getBioDataById, updateBioData, deleteBioData } from "@/lib/db"

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
    const item = await getBioDataById(id)
    if (!item) {
      return NextResponse.json({ error: "BioData record not found" }, { status: 404 })
    }
    return NextResponse.json(item)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load biodata record" }, { status: 500 })
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

  const { id } = await params
  try {
    const updates = await request.json()
    const updated = await updateBioData(id, updates)
    if (!updated) {
      return NextResponse.json({ error: "BioData record not found" }, { status: 404 })
    }
    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update biodata" }, { status: 500 })
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

  const { id } = await params
  try {
    const success = await deleteBioData(id)
    if (!success) {
      return NextResponse.json({ error: "BioData record not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete biodata record" }, { status: 500 })
  }
}
