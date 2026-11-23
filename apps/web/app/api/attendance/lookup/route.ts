import { NextRequest, NextResponse } from "next/server"
import { lookupStaffForAttendance, getTodayAttendance, getTodayDateString } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const staffUid = body.staff_uid || body.staff_id || body.query

    if (!staffUid || typeof staffUid !== "string" || !staffUid.trim()) {
      return NextResponse.json(
        { error: "Please provide a valid Staff ID or UID." },
        { status: 400 }
      )
    }

    const staff = await lookupStaffForAttendance(staffUid)

    if (!staff) {
      return NextResponse.json(
        {
          error: `No registered personnel record found for "${staffUid.trim()}". Please verify your Staff UID or contact HR.`,
        },
        { status: 404 }
      )
    }

    const todayDate = getTodayDateString()
    const todayAttendance = await getTodayAttendance(staff.staff_uid, todayDate)

    const isCheckedIn = Boolean(todayAttendance)
    const isCheckedOut = Boolean(todayAttendance?.check_out_time)

    const fullName = `${staff.first_name} ${staff.last_name} ${
      staff.other_name ? staff.other_name : ""
    }`.trim()

    return NextResponse.json({
      staff: {
        id: staff.id,
        staff_uid: staff.staff_uid,
        name: fullName,
        first_name: staff.first_name,
        last_name: staff.last_name,
        designation: staff.designation || "Staff Member",
        department: staff.department || "General",
        passport: staff.passport_url || "",
        workstation: staff.workstation || "Headquarters",
        email: staff.company_email || staff.email,
      },
      today_attendance: todayAttendance,
      today_date: todayDate,
      isCheckedIn,
      isCheckedOut,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to look up staff attendance record" },
      { status: 500 }
    )
  }
}
