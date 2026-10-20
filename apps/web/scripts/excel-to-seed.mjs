// Converts data/content.xlsx (sheet "content_items") into data/seed.json.
// The app re-syncs services, solutions, team, partners and careers from
// seed.json whenever its contents change (see lib/db.ts → syncContentFromSeed).
//
// Usage (from apps/web):  npm run import:excel [path/to/file.xlsx]
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import * as XLSX from "xlsx"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, "..", "data")
const input = process.argv[2] ? path.resolve(process.argv[2]) : path.join(dataDir, "content.xlsx")
const output = path.join(dataDir, "seed.json")

const workbook = XLSX.read(fs.readFileSync(input))
const sheet = workbook.Sheets["content_items"] || workbook.Sheets[workbook.SheetNames[0]]
const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" })

const content_items = rows
  .filter((r) => r.type && r.title)
  .map((r) => ({
    id: Number(r.id) || r.id,
    type: String(r.type).trim().toLowerCase(),
    title: String(r.title).trim(),
    slug: String(r.slug || "").trim(),
    description: String(r.description || ""),
    body: String(r.body || ""),
    icon: String(r.icon || ""),
    image_base64: String(r.image_base64 || ""),
    image_mime: String(r.image_mime || ""),
    document_base64: String(r.document_base64 || ""),
    document_name: String(r.document_name || ""),
    document_mime: String(r.document_mime || ""),
    meta_json: String(r.meta_json || "{}"),
    sort_order: Number(r.sort_order) || 0,
    active: String(r.active).toLowerCase() !== "false",
    created_at: String(r.created_at || ""),
    updated_at: String(r.updated_at || ""),
  }))

fs.writeFileSync(output, JSON.stringify({ content_items }, null, 1))

const counts = content_items.reduce((acc, i) => ((acc[i.type] = (acc[i.type] || 0) + 1), acc), {})
console.log(`Wrote ${content_items.length} items to ${output}`, counts)
