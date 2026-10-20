import { NextRequest, NextResponse } from "next/server"
import { createContact } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, organization = "", email, phone = "", topic = "", message } = body || {}

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email and message are required." },
        { status: 400 }
      )
    }

    const contact = await createContact({
      name: String(name).trim(),
      organization: String(organization).trim(),
      email: String(email).trim(),
      phone: String(phone).trim(),
      topic: String(topic).trim(),
      message: String(message).trim(),
    })

    return NextResponse.json({ success: true, id: contact._id }, { status: 201 })
  } catch (error: any) {
    console.error("Contact submission error:", error)
    return NextResponse.json({ error: error.message || "Failed to submit contact message" }, { status: 500 })
  }
}
