import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser, hasPermission } from "@/lib/auth"
import { saveImageBytes } from "@/lib/db"
import { uploadToCloudinary } from "@/lib/cloudinary"

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

    const folder = (formData.get("folder") as string) || "tr3g"
    let resourceType: "image" | "video" | "raw" | "auto" = "auto"
    if (mime.startsWith("video/")) {
      resourceType = "video"
    } else if (mime.startsWith("image/")) {
      resourceType = "image"
    }

    // Attempt Cloudinary upload first
    let cldResult = null
    try {
      cldResult = await uploadToCloudinary(buffer, {
        folder,
        resourceType,
        filename,
        mime,
      })
    } catch (cldErr) {
      console.warn("Cloudinary upload failed, falling back to local datastore:", cldErr)
    }

    // Always ensure a fallback or DB entry if needed
    const id = await saveImageBytes(filename, mime, buffer)

    if (cldResult) {
      return NextResponse.json({
        success: true,
        id: cldResult.public_id || id,
        db_id: id,
        url: cldResult.secure_url || cldResult.url,
        secure_url: cldResult.secure_url || cldResult.url,
        public_id: cldResult.public_id,
        resource_type: cldResult.resource_type,
        format: cldResult.format,
        filename,
        mime,
        size: buffer.length,
      })
    }

    return NextResponse.json({
      success: true,
      id,
      url: `/api/images/${id}`,
      secure_url: `/api/images/${id}`,
      filename,
      mime,
      size: buffer.length,
    })
  } catch (error: any) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 })
  }
}
