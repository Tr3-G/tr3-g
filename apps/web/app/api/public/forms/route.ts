import { NextResponse } from "next/server"
import { getRecruitmentForms } from "@/lib/db"

export async function GET() {
  const forms = await getRecruitmentForms(false)
  return NextResponse.json(forms)
}
