import { NextRequest, NextResponse } from "next/server"
import { createApplication, getContentById, saveImageBytes } from "@/lib/db"
import { uploadToCloudinary } from "@/lib/cloudinary"
import { sendApplicationConfirmationEmail } from "@/lib/brevo"

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || ""

    let fullName = ""
    let email = ""
    let phone = ""
    let link = ""
    let coverNote = ""
    let careerId: string | number | null = null
    let resumeId: string | null = null
    let resumeName: string | null = null
    let resumeMime: string | null = null
    let formId: string | null = null
    let formTitle: string | null = null
    let customAnswers: Record<string, any> = {}

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      fullName = (formData.get("fullName") as string) || (formData.get("full-name") as string) || ""
      email = (formData.get("email") as string) || ""
      phone = (formData.get("phone") as string) || ""
      link = (formData.get("link") as string) || ""
      coverNote = (formData.get("coverNote") as string) || (formData.get("cover-note") as string) || ""
      careerId = (formData.get("careerId") as string) || (formData.get("role") as string) || null
      formId = (formData.get("formId") as string) || null
      formTitle = (formData.get("formTitle") as string) || null

      const rawAnswers = formData.get("customAnswers") as string | null
      if (rawAnswers) {
        try {
          customAnswers = JSON.parse(rawAnswers)
        } catch {}
      }

      const file = formData.get("resume") as File | null
      if (file && file.size > 0) {
        const arrayBuf = await file.arrayBuffer()
        const buf = Buffer.from(arrayBuf)
        resumeName = file.name || "resume.pdf"
        resumeMime = file.type || "application/pdf"

        // Attempt Cloudinary document upload
        let cldDoc = null
        try {
          cldDoc = await uploadToCloudinary(buf, {
            folder: "tr3g/resumes",
            resourceType: "raw",
            filename: resumeName,
            mime: resumeMime,
          })
        } catch (cldErr) {
          console.warn("Cloudinary resume upload failed, saving locally:", cldErr)
        }

        if (cldDoc && cldDoc.secure_url) {
          resumeId = cldDoc.secure_url
        } else {
          resumeId = await saveImageBytes(resumeName, resumeMime, buf)
        }
      }
    } else {
      const body = await request.json()
      fullName = body.fullName || body["full-name"] || ""
      email = body.email || ""
      phone = body.phone || ""
      link = body.link || ""
      coverNote = body.coverNote || body["cover-note"] || ""
      careerId = body.careerId || body.role || null
      formId = body.formId || null
      formTitle = body.formTitle || null
      customAnswers = body.customAnswers || {}

      if (body.resume && body.resume.base64) {
        const buf = Buffer.from(body.resume.base64, "base64")
        const name = body.resume.name || "resume.pdf"
        const mime = body.resume.mime || "application/pdf"
        resumeName = name
        resumeMime = mime

        let cldDoc = null
        try {
          cldDoc = await uploadToCloudinary(buf, {
            folder: "tr3g/resumes",
            resourceType: "raw",
            filename: name,
            mime,
          })
        } catch (cldErr) {
          console.warn("Cloudinary resume upload failed, saving locally:", cldErr)
        }

        if (cldDoc && cldDoc.secure_url) {
          resumeId = cldDoc.secure_url
        } else {
          resumeId = await saveImageBytes(name, mime, buf)
        }
      }
    }

    if (!fullName.trim() || !email.trim()) {
      return NextResponse.json(
        { error: "Full name and email are required." },
        { status: 400 }
      )
    }

    let careerTitle = "General Application"
    if (careerId) {
      const career = await getContentById(String(careerId))
      if (career && career.title) {
        careerTitle = career.title
      }
    }

    const application = await createApplication({
      career_id: careerId ?? undefined,
      career_title: careerTitle,
      form_id: formId,
      form_title: formTitle,
      custom_answers: customAnswers,
      full_name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      link: link.trim(),
      cover_note: coverNote.trim() || "Submitted via recruitment form",
      resume_id: resumeId,
      resume_name: resumeName,
      resume_mime: resumeMime,
    })

    // Send confirmation email via Brevo
    try {
      await sendApplicationConfirmationEmail({
        toEmail: email.trim(),
        toName: fullName.trim(),
        roleTitle: careerTitle,
        applicantName: fullName.trim(),
        referenceId: application._id,
      })
    } catch (mailErr) {
      console.warn("Brevo confirmation email skipped or failed:", mailErr)
    }

    return NextResponse.json({ success: true, id: application._id }, { status: 201 })
  } catch (error: any) {
    console.error("Application submission error:", error)
    return NextResponse.json({ error: error.message || "Failed to submit application" }, { status: 500 })
  }
}
