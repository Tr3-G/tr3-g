import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { deleteAttendance } from "@/lib/db"

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
    const deleted = await deleteAttendance(id)
    if (!deleted) {
      return NextResponse.json({ error: "Attendance log not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true, message: "Attendance log deleted." })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete log" }, { status: 500 })
  }
}
