import { NextResponse } from "next/server"
import { getGalleryItems } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const items = await getGalleryItems(false)
    return NextResponse.json(items)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch gallery" }, { status: 500 })
  }
}
