import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getReportById, approveReport, logAudit } from "@/lib/db"
import { sendReportApprovedEmail } from "@/lib/brevo"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  const { id } = await params
  try {
    const existing = await getReportById(id)
    if (!existing) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    let notes = ""
    try {
      const body = await request.json()
      notes = body.admin_notes || ""
    } catch {
      // Body is optional
    }

    const adminName = (user as any).name || (user as any).username || "Executive Administrator"

    const updated = await approveReport(id, adminName, (user as any).id, notes)
    if (!updated) {
      return NextResponse.json({ error: "Failed to approve report" }, { status: 500 })
    }

    await logAudit({
      actor_id: (user as any).id,
      actor_name: adminName,
      actor_role: (user as any).role || "admin",
      action: "APPROVE",
      resource: "reports",
      resource_id: id,
      details: `Report "${existing.title}" by ${existing.staff_name || existing.staff_uid} approved.`,
      status: "success",
    }).catch(() => {})

    // Send Brevo email to the staff member who submitted the report
    let emailSent = false
    try {
      const mailRes = await sendReportApprovedEmail({
        toEmail: updated.email,
        toName: updated.staff_name || updated.staff_uid,
        staffUid: updated.staff_uid,
        reportTitle: updated.title,
        reportId: updated.id,
        workstation: updated.workstation,
        adminName,
        adminNotes: notes,
      })
      emailSent = mailRes.success
    } catch (mailErr) {
      console.error("Failed to send approval email:", mailErr)
    }

    return NextResponse.json({
      success: true,
      message: `Report approved by ${adminName}. Notification email dispatched to ${updated.email}.`,
      report: updated,
      emailSent,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process report approval." },
      { status: 500 }
    )
  }
}
