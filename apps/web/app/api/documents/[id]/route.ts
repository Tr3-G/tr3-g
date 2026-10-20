import { NextRequest, NextResponse } from "next/server"
import { getImageBytes } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!id) {
    return new NextResponse("Document ID is required", { status: 400 })
  }

  const file = await getImageBytes(id)
  if (!file || !file.buffer) {
    return new NextResponse("Document not found", { status: 404 })
  }

  return new Response(new Uint8Array(file.buffer), {
    status: 200,
    headers: {
      "Content-Type": file.mime || "application/octet-stream",
      "Content-Length": String(file.size || file.buffer.length),
      "Content-Disposition": `attachment; filename="${encodeURIComponent(file.filename || "document")}"`,
    },
  })
}
