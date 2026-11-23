import { NextRequest, NextResponse } from "next/server"
import {
  lookupStaffForAttendance,
  getTodayAttendance,
  checkInStaff,
  checkOutStaff,
  getTodayDateString,
} from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { staff_uid, action, notes } = body

    if (!staff_uid || !action) {
      return NextResponse.json(
        { error: "Staff UID and action ('check_in' or 'check_out') are required." },
        { status: 400 }
      )
    }

    const staff = await lookupStaffForAttendance(staff_uid)
    if (!staff) {
      return NextResponse.json(
        { error: `Staff profile for "${staff_uid}" not found in personnel registry.` },
        { status: 404 }
      )
    }

    const todayDate = getTodayDateString()
    const existing = await getTodayAttendance(staff.staff_uid, todayDate)

    const fullName = `${staff.first_name} ${staff.last_name} ${staff.other_name || ""}`.trim()

    if (action === "check_in") {
      if (existing) {
        return NextResponse.json(
          {
            error: `${fullName} is already checked in for today (${new Date(
              existing.check_in_time
            ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}).`,
            alreadyCheckedIn: true,
            attendance: existing,
          },
          { status: 409 }
        )
      }

      const { attendance } = await checkInStaff({
        staff_uid: staff.staff_uid,
        staff_id: staff.id,
        staff_name: fullName,
        designation: staff.designation,
        department: staff.department,
        passport: staff.passport_url,
        workstation: staff.workstation,
        notes: notes || "",
      })

      const timeFormatted = new Date(attendance.check_in_time).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })

      return NextResponse.json({
        success: true,
        action: "check_in",
        message: `Welcome, ${staff.first_name}! Check-in confirmed at ${timeFormatted}.`,
        attendance,
        staff: {
          staff_uid: staff.staff_uid,
          name: fullName,
          designation: staff.designation,
          passport: staff.passport_url,
        },
      })
    }

    if (action === "check_out") {
      if (!existing) {
        return NextResponse.json(
          {
            error: `Cannot check out: No active check-in record found for ${fullName} today.`,
          },
          { status: 400 }
        )
      }

      if (existing.check_out_time) {
        return NextResponse.json(
          {
            error: `${fullName} has already completed check-out for today at ${new Date(
              existing.check_out_time
            ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`,
            alreadyCheckedOut: true,
            attendance: existing,
          },
          { status: 409 }
        )
      }

      const updated = await checkOutStaff(existing.id, notes)

      const timeFormatted = updated?.check_out_time
        ? new Date(updated.check_out_time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "now"

      const hours = Math.floor((updated?.duration_minutes || 0) / 60)
      const mins = (updated?.duration_minutes || 0) % 60
      const durationStr = `${hours}h ${mins}m`

      return NextResponse.json({
        success: true,
        action: "check_out",
        message: `Goodbye, ${staff.first_name}! Check-out confirmed at ${timeFormatted}. Total duration: ${durationStr}.`,
        attendance: updated,
        duration: durationStr,
        staff: {
          staff_uid: staff.staff_uid,
          name: fullName,
          designation: staff.designation,
          passport: staff.passport_url,
        },
      })
    }

    return NextResponse.json(
      { error: "Invalid action. Allowed actions are 'check_in' and 'check_out'." },
      { status: 400 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Attendance action processing failed." },
      { status: 500 }
    )
  }
}
