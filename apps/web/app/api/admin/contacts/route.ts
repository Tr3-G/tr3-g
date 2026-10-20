import { NextResponse } from "next/server"
import { getCurrentUser, hasPermission } from "@/lib/auth"
import { getContacts } from "@/lib/db"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }
  if (!hasPermission(user, "read")) {
    return NextResponse.json({ error: "Permission denied (read)" }, { status: 403 })
  }

  const contacts = await getContacts()
  return NextResponse.json(contacts)
}
