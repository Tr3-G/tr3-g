import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser, hasPermission } from "@/lib/auth"
import { getGalleryItems, createGalleryItem } from "@/lib/db"

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  try {
    const items = await getGalleryItems(true)
    return NextResponse.json(items)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch gallery" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }
  if (!hasPermission(user, "create")) {
    return NextResponse.json({ error: "Permission denied (create)" }, { status: 403 })
  }

  try {
    const body = await request.json()
    if (!body.title || !body.media_url) {
      return NextResponse.json({ error: "Title and media URL are required" }, { status: 400 })
    }

    const item = await createGalleryItem({
      title: body.title.trim(),
      description: body.description?.trim() || "",
      media_url: body.media_url,
      media_type: body.media_type === "video" ? "video" : "image",
      public_id: body.public_id || null,
      is_public: body.is_public !== false,
      file_size: Number(body.file_size || 0),
      mime_type: body.mime_type || "",
      sort_order: Number(body.sort_order || 0),
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create gallery item" }, { status: 500 })
  }
}
