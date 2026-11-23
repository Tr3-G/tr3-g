import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getReportById, updateReportStatus, deleteReport } from "@/lib/db"

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
    const report = await getReportById(id)
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }
    return NextResponse.json(report)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load report" },
      { status: 500 }
    )
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
    const body = await request.json()
    const updated = await updateReportStatus(id, body.status, body.admin_notes)
    if (!updated) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }
    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update report" },
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

  const { id } = await params
  try {
    const deleted = await deleteReport(id)
    if (!deleted) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true, message: "Report deleted." })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete report" },
      { status: 500 }
    )
  }
}
