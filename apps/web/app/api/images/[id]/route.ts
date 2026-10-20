import { NextRequest, NextResponse } from "next/server"
import { getImageBytes } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!id) {
    return new NextResponse("Image ID is required", { status: 400 })
  }

  const image = await getImageBytes(id)
  if (!image || !image.buffer) {
    return new NextResponse("Image not found", { status: 404 })
  }

  return new Response(new Uint8Array(image.buffer), {
    status: 200,
    headers: {
      "Content-Type": image.mime || "image/jpeg",
      "Content-Length": String(image.size || image.buffer.length),
      "Content-Disposition": `inline; filename="${encodeURIComponent(image.filename || "image")}"`,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
