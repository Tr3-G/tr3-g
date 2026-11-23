import crypto from "node:crypto"

export interface CloudinaryUploadResult {
  public_id: string
  url: string
  secure_url: string
  resource_type: string
  format: string
  bytes: number
  original_filename?: string
}

export async function uploadToCloudinary(
  buffer: Buffer,
  options: {
    folder?: string
    resourceType?: "image" | "video" | "raw" | "auto"
    filename?: string
    mime?: string
  } = {}
): Promise<CloudinaryUploadResult | null> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET

  if (!cloudName) {
    return null
  }

  const resourceType = options.resourceType || "auto"
  const folder = options.folder || "tr3g"
  const timestamp = Math.floor(Date.now() / 1000)

  const mime = options.mime || "application/octet-stream"
  const base64Data = `data:${mime};base64,${buffer.toString("base64")}`

  const formData = new FormData()
  formData.append("file", base64Data)

  if (uploadPreset) {
    formData.append("upload_preset", uploadPreset)
    if (folder) formData.append("folder", folder)
  } else if (apiKey && apiSecret) {
    formData.append("api_key", apiKey)
    formData.append("timestamp", String(timestamp))
    formData.append("folder", folder)

    const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`
    const signature = crypto.createHash("sha1").update(paramsToSign).digest("hex")
    formData.append("signature", signature)
  } else {
    return null
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("Cloudinary upload failed:", response.status, errorText)
    throw new Error(`Cloudinary upload failed: ${errorText}`)
  }

  const data = await response.json()
  return {
    public_id: data.public_id,
    url: data.url,
    secure_url: data.secure_url,
    resource_type: data.resource_type,
    format: data.format,
    bytes: data.bytes,
    original_filename: data.original_filename,
  }
}
