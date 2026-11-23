import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getAuditLogs, getAuditStats, clearAuditLogs, logAudit } from "@/lib/db"

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action") || undefined
    const resource = searchParams.get("resource") || undefined
    const actor = searchParams.get("actor") || undefined
    const status = searchParams.get("status") || undefined
    const search = searchParams.get("search") || undefined
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 250

    const [logs, stats] = await Promise.all([
      getAuditLogs({
        action,
        resource,
        actor,
        status,
        search,
        limit,
      }),
      getAuditStats(),
    ])

    return NextResponse.json({ logs, stats })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load audit logs" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  try {
    const body = await request.json()
    if (!body.action || !body.resource || !body.details) {
      return NextResponse.json(
        { error: "action, resource, and details are required." },
        { status: 400 }
      )
    }

    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || ""
    const userAgent = request.headers.get("user-agent") || ""

    const actorName = (user as any).full_name || (user as any).name || user.username || "Admin"

    const entry = await logAudit({
      actor_id: user.id,
      actor_name: actorName,
      actor_role: user.role || "admin",
      action: body.action,
      resource: body.resource,
      resource_id: body.resource_id,
      details: body.details,
      ip_address: ip,
      user_agent: userAgent,
      status: body.status || "success",
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create audit log" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  if ((user.role as string) !== "superadmin") {
    return NextResponse.json(
      { error: "Permission denied: Only Superadmins can clear the system audit log." },
      { status: 403 }
    )
  }

  try {
    await clearAuditLogs()

    // Log the purge action itself
    const superadminName = (user as any).full_name || (user as any).name || user.username || "Superadmin"
    await logAudit({
      actor_id: user.id,
      actor_name: superadminName,
      actor_role: user.role,
      action: "DELETE",
      resource: "audit_logs",
      details: "Audit logs table purged by Superadmin.",
      status: "warning",
    })

    return NextResponse.json({ success: true, message: "Audit logs cleared." })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to clear audit logs" },
      { status: 500 }
    )
  }
}
