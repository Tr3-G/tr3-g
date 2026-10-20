import { NextRequest, NextResponse } from "next/server"
import { getContentList } from "@/lib/db"

const VALID_TYPES = ["service", "solution", "team", "partner", "career", "stack"]

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Invalid content type" }, { status: 400 })
  }

  const items = await getContentList(type, false)
  return NextResponse.json(items)
}
