import { NextRequest, NextResponse } from "next/server"
import { createReport, lookupStaffForAttendance } from "@/lib/db"
import { uploadToCloudinary } from "@/lib/cloudinary"
import { saveImageBytes } from "@/lib/db"
import { sendReportReceivedEmail } from "@/lib/brevo"

async function uploadReportFileHelper(file: File | null): Promise<{ url: string; name: string; type: string }> {
  if (!file || file.size === 0) return { url: "", name: "", type: "" }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = file.name || "report_attachment"
    const mime = file.type || "application/octet-stream"

    const isImage = mime.startsWith("image/")
    const resourceType = isImage ? "image" : "auto"

    try {
      const cld = await uploadToCloudinary(buffer, {
        folder: "tr3g/reports",
        resourceType,
        filename,
        mime,
      })
      if (cld && cld.secure_url) {
        return { url: cld.secure_url, name: filename, type: mime }
      }
    } catch (cldErr) {
      console.warn("Cloudinary upload failed for report file, saving locally:", cldErr)
    }

    const id = await saveImageBytes(filename, mime, buffer)
    return { url: `/api/images/${id}`, name: filename, type: mime }
  } catch (err) {
    console.error("Error processing report file upload:", err)
    return { url: "", name: "", type: "" }
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || ""

    let staffUid = ""
    let workstation = ""
    let email = ""
    let title = ""
    let body = ""
    let fileUrl = ""
    let fileName = ""
    let fileType = ""

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()

      staffUid = ((formData.get("staff_uid") || formData.get("staff_id")) as string) || ""
      workstation = (formData.get("workstation") as string) || ""
      email = (formData.get("email") as string) || ""
      title = (formData.get("title") as string) || ""
      body = (formData.get("body") as string) || ""

      const uploadedFile = formData.get("file") as File | null
      if (uploadedFile && uploadedFile.size > 0) {
        const uploaded = await uploadReportFileHelper(uploadedFile)
        fileUrl = uploaded.url
        fileName = uploaded.name
        fileType = uploaded.type
      } else {
        fileUrl = (formData.get("file_url") as string) || ""
        fileName = (formData.get("file_name") as string) || ""
        fileType = (formData.get("file_type") as string) || ""
      }
    } else {
      const json = await request.json()
      staffUid = json.staff_uid || json.staff_id || ""
      workstation = json.workstation || ""
      email = json.email || ""
      title = json.title || ""
      body = json.body || ""
      fileUrl = json.file_url || ""
      fileName = json.file_name || ""
      fileType = json.file_type || ""
    }

    if (!staffUid.trim() || !workstation.trim() || !email.trim() || !title.trim() || !body.trim()) {
      return NextResponse.json(
        {
          error:
            "Please provide all required fields: Staff ID, Workstation, Email, Report Title, and Report Body.",
        },
        { status: 400 }
      )
    }

    // Lookup staff name if enrolled
    let staffName = ""
    const bio = await lookupStaffForAttendance(staffUid)
    if (bio) {
      staffName = `${bio.first_name} ${bio.last_name} ${bio.other_name || ""}`.trim()
    }

    const report = await createReport({
      staff_uid: staffUid.trim().toUpperCase(),
      staff_name: staffName,
      workstation: workstation.trim(),
      email: email.trim().toLowerCase(),
      title: title.trim(),
      body: body.trim(),
      file_url: fileUrl,
      file_name: fileName,
      file_type: fileType,
    })

    // Send confirmation email via Brevo
    try {
      await sendReportReceivedEmail({
        toEmail: report.email,
        toName: staffName || report.staff_uid,
        staffUid: report.staff_uid,
        reportTitle: report.title,
        reportId: report.id,
        workstation: report.workstation,
      })
    } catch (mailErr) {
      console.error("Failed to send report received email:", mailErr)
    }

    return NextResponse.json(
      {
        success: true,
        message: "Your report has been submitted and confirmed. A notification email has been dispatched to your email address.",
        report,
      },
      { status: 201 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to submit report." },
      { status: 500 }
    )
  }
}
