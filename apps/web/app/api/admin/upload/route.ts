import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser, hasPermission } from "@/lib/auth"
import { saveImageBytes } from "@/lib/db"

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }
  if (!hasPermission(user, "create") && !hasPermission(user, "update")) {
    return NextResponse.json(
      { error: "Insufficient permissions to upload files" },
      { status: 403 }
    )
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const mime = file.type || "application/octet-stream"
    const filename = file.name || "upload"

    const id = await saveImageBytes(filename, mime, buffer)

    return NextResponse.json({
      success: true,
      id,
      url: `/api/images/${id}`,
      filename,
      mime,
      size: buffer.length,
    })
  } catch (error: any) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 })
  }
}
