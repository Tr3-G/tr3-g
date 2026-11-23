import { NextRequest, NextResponse } from "next/server"
import { createBioData, saveImageBytes } from "@/lib/db"
import { uploadToCloudinary } from "@/lib/cloudinary"

async function uploadFileHelper(file: File | null, prefix: string): Promise<string> {
  if (!file || file.size === 0) return ""
  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const mime = file.type || "image/jpeg"
    const filename = `${prefix}_${Date.now()}_${file.name || "upload"}`

    // Attempt Cloudinary upload
    try {
      const cld = await uploadToCloudinary(buffer, {
        folder: "tr3g/biodata",
        resourceType: "image",
        filename,
        mime,
      })
      if (cld && cld.secure_url) {
        return cld.secure_url
      }
    } catch (cldErr) {
      console.warn("Cloudinary upload failed for biodata file, saving locally:", cldErr)
    }

    const id = await saveImageBytes(filename, mime, buffer)
    return `/api/images/${id}`
  } catch (err) {
    console.error("Error processing file upload:", err)
    return ""
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || ""

    let bodyData: any = {}
    let passportUrl = ""
    let guarantor1PassportUrl = ""
    let guarantor2PassportUrl = ""
    let idCardFrontUrl = ""
    let idCardBackUrl = ""

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()

      // Handle file uploads
      const passportFile = formData.get("passport") as File | null
      const g1PassportFile = formData.get("guarantor_1_passport") as File | null
      const g2PassportFile = formData.get("guarantor_2_passport") as File | null
      const idFrontFile = formData.get("id_card_front") as File | null
      const idBackFile = formData.get("id_card_back") as File | null

      const [pUrl, g1Url, g2Url, idFUrl, idBUrl] = await Promise.all([
        uploadFileHelper(passportFile, "passport"),
        uploadFileHelper(g1PassportFile, "g1_passport"),
        uploadFileHelper(g2PassportFile, "g2_passport"),
        uploadFileHelper(idFrontFile, "id_front"),
        uploadFileHelper(idBackFile, "id_back"),
      ])

      passportUrl = pUrl || (formData.get("passport_url") as string) || ""
      guarantor1PassportUrl = g1Url || (formData.get("guarantor_1_passport_url") as string) || ""
      guarantor2PassportUrl = g2Url || (formData.get("guarantor_2_passport_url") as string) || ""
      idCardFrontUrl = idFUrl || (formData.get("id_card_front_url") as string) || ""
      idCardBackUrl = idBUrl || (formData.get("id_card_back_url") as string) || ""

      // Read text fields
      bodyData = {
        first_name: (formData.get("first_name") as string) || "",
        last_name: (formData.get("last_name") as string) || "",
        other_name: (formData.get("other_name") as string) || "",
        email: (formData.get("email") as string) || "",
        phone_number: (formData.get("phone_number") as string) || "",
        phone_number_2: (formData.get("phone_number_2") as string) || "",
        marital_status: (formData.get("marital_status") as string) || "Single",
        date_of_birth: (formData.get("date_of_birth") as string) || "",
        gender: (formData.get("gender") as string) || "Male",
        state_of_origin: (formData.get("state_of_origin") as string) || "",
        lga_of_origin: (formData.get("lga_of_origin") as string) || "",
        current_state_of_residence: (formData.get("current_state_of_residence") as string) || "",
        current_lga_of_residence:
          (formData.get("current_lga_of_residence") as string) ||
          (formData.get("current_lga_of_origin") as string) ||
          "",
        current_residence_address: (formData.get("current_residence_address") as string) || "",
        country: (formData.get("country") as string) || "Nigeria",
        disability: (formData.get("disability") as string) || "None",

        // Guarantors
        guarantor_1: {
          full_name: (formData.get("guarantor_1_name") as string) || "",
          email: (formData.get("guarantor_1_email") as string) || "",
          phone: (formData.get("guarantor_1_phone") as string) || "",
          address: (formData.get("guarantor_1_address") as string) || "",
          passport_url: guarantor1PassportUrl,
        },
        guarantor_2: {
          full_name: (formData.get("guarantor_2_name") as string) || "",
          email: (formData.get("guarantor_2_email") as string) || "",
          phone: (formData.get("guarantor_2_phone") as string) || "",
          address: (formData.get("guarantor_2_address") as string) || "",
          passport_url: guarantor2PassportUrl,
        },

        // Identification
        identification_nin: (formData.get("identification_nin") as string) || "",

        // Institutional
        designation: (formData.get("designation") as string) || "",
        company_email: (formData.get("company_email") as string) || "",
        department: (formData.get("department") as string) || "",
        idcard: formData.get("idcard") === "true" || formData.get("idcard") === "on",
        reference: (formData.get("reference") as string) || "",
        workstation: (formData.get("workstation") as string) || "",
      }
    } else {
      bodyData = await request.json()
      passportUrl = bodyData.passport_url || ""
      idCardFrontUrl = bodyData.id_card_front_url || ""
      idCardBackUrl = bodyData.id_card_back_url || ""
    }

    if (!bodyData.first_name?.trim() || !bodyData.last_name?.trim() || !bodyData.email?.trim() || !bodyData.phone_number?.trim()) {
      return NextResponse.json(
        { error: "First name, last name, email, and phone number are required." },
        { status: 400 }
      )
    }

    const created = await createBioData({
      ...bodyData,
      passport_url: passportUrl,
      id_card_front_url: idCardFrontUrl,
      id_card_back_url: idCardBackUrl,
      status: "pending",
    })

    return NextResponse.json(
      {
        success: true,
        id: created._id,
        staff_uid: created.staff_uid,
        message: "BioData submitted successfully",
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("BioData submission error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to submit BioData" },
      { status: 500 }
    )
  }
}
