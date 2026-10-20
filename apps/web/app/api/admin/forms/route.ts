import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser, hasPermission } from "@/lib/auth"
import { getRecruitmentForms, createRecruitmentForm } from "@/lib/db"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }
  if (!hasPermission(user, "read")) {
    return NextResponse.json({ error: "Permission denied (read)" }, { status: 403 })
  }

  const forms = await getRecruitmentForms(true)
  return NextResponse.json(forms)
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }
  if (!hasPermission(user, "create")) {
    return NextResponse.json(
      { error: "Permission denied: You do not have permission to create recruitment forms" },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    if (!body.title) {
      return NextResponse.json({ error: "Form title is required" }, { status: 400 })
    }

    const newForm = await createRecruitmentForm(body)
    return NextResponse.json(newForm, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create recruitment form" },
      { status: 500 }
    )
  }
}
