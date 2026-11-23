import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getBioDataList, createBioData } from "@/lib/db"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  try {
    const list = await getBioDataList()
    return NextResponse.json(list)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load biodata list" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  try {
    const body = await request.json()
    if (!body.first_name || !body.last_name || !body.email || !body.phone_number) {
      return NextResponse.json(
        { error: "First name, last name, email, and phone number are required" },
        { status: 400 }
      )
    }

    const created = await createBioData(body)
    return NextResponse.json(created, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create biodata" }, { status: 500 })
  }
}
