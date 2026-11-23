import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sendCustomEmail } from "@/lib/brevo"

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { toEmail, toName, subject, message, category } = body || {}

    if (!toEmail || typeof toEmail !== "string" || !toEmail.includes("@")) {
      return NextResponse.json({ error: "A valid recipient email is required" }, { status: 400 })
    }

    if (!subject || typeof subject !== "string" || !subject.trim()) {
      return NextResponse.json({ error: "Email subject is required" }, { status: 400 })
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Email message body is required" }, { status: 400 })
    }

    const result = await sendCustomEmail({
      toEmail: toEmail.trim(),
      toName: toName ? String(toName).trim() : undefined,
      subject: subject.trim(),
      message: message.trim(),
      category,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to dispatch email via Brevo" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      dispatchedTo: toEmail.trim(),
    })
  } catch (error: any) {
    console.error("Email dispatch error:", error)
    return NextResponse.json({ error: error.message || "Email dispatch failed" }, { status: 500 })
  }
}
