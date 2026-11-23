import { NextRequest, NextResponse } from "next/server"
import { getAttendanceLogs, getAttendanceStats, getTodayDateString } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get("date") || undefined
    const departmentParam = searchParams.get("department") || undefined
    const staffUidParam = searchParams.get("staff_uid") || undefined
    const statusParam = searchParams.get("status") || undefined
    const limitParam = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : 200

    const todayDate = getTodayDateString()
    const effectiveDate = dateParam === "all" ? undefined : dateParam || todayDate

    const [logs, stats] = await Promise.all([
      getAttendanceLogs({
        date: effectiveDate,
        department: departmentParam,
        staff_uid: staffUidParam,
        status: statusParam,
        limit: limitParam,
      }),
      getAttendanceStats(effectiveDate || todayDate),
    ])

    return NextResponse.json({
      logs,
      stats,
      date: effectiveDate || "all",
      today: todayDate,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch attendance logs." },
      { status: 500 }
    )
  }
}
