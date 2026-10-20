import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser, hasPermission } from "@/lib/auth"
import { getContentList, createContentItem } from "@/lib/db"

const VALID_TYPES = ["service", "solution", "team", "partner", "career"]

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }
  if (!hasPermission(user, "read")) {
    return NextResponse.json({ error: "Permission denied (read)" }, { status: 403 })
  }

  const { type } = await params
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Invalid content type" }, { status: 400 })
  }

  const items = await getContentList(type, true)
  return NextResponse.json(items)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }
  if (!hasPermission(user, "create")) {
    return NextResponse.json({ error: "Permission denied: You do not have permission to create items" }, { status: 403 })
  }

  const { type } = await params
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Invalid content type" }, { status: 400 })
  }

  try {
    const body = await request.json()
    if (!body.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const item = await createContentItem({
      ...body,
      type: type as any,
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error: any) {
    console.error("Create content error:", error)
    return NextResponse.json({ error: error.message || "Failed to create item" }, { status: 500 })
  }
}
