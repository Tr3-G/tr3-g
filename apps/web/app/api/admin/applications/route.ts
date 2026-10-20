import { NextResponse } from "next/server"
import { getCurrentUser, hasPermission } from "@/lib/auth"
import { getApplications } from "@/lib/db"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }
  if (!hasPermission(user, "read")) {
    return NextResponse.json({ error: "Permission denied (read)" }, { status: 403 })
  }

  const apps = await getApplications()
  return NextResponse.json(apps)
}
