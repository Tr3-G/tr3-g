import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getReportsList } from "@/lib/db"

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || undefined
    const search = searchParams.get("search") || undefined
    const staffUid = searchParams.get("staff_uid") || undefined

    const list = await getReportsList({
      status,
      search,
      staff_uid: staffUid,
    })

    return NextResponse.json(list)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load reports" },
      { status: 500 }
    )
  }
}
