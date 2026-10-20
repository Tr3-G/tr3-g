import postgres from "postgres"
import argon2 from "argon2"
import crypto from "node:crypto"

export interface ContentItem {
  _id?: string
  id?: number | string
  type: "service" | "solution" | "team" | "partner" | "career" | "stack"
  title: string
  slug: string
  description: string
  body?: string
  icon?: string
  image_id?: string | null
  image_mime?: string | null
  image_bytes?: string | null
  document_id?: string | null
  document_name?: string | null
  document_mime?: string | null
  meta: Record<string, any>
  sort_order: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface Application {
  _id?: string
  career_id?: string | number | null
  career_title?: string | null
  form_id?: string | null
  form_title?: string | null
  custom_answers?: Record<string, any>
  full_name: string
  email: string
  phone?: string
  link?: string
  cover_note: string
  resume_id?: string | null
  resume_name?: string | null
  resume_mime?: string | null
  status: "new" | "reviewing" | "shortlisted" | "rejected" | "hired"
  created_at: string
}

export interface FormField {
  id: string
  label: string
  type: "text" | "textarea" | "email" | "tel" | "number" | "select" | "checkbox" | "file"
  placeholder?: string
  required: boolean
  options?: string[]
  helperText?: string
}

export interface RecruitmentForm {
  _id?: string
  title: string
  code: string
  description: string
  category?: string
  career_ids?: string[]
  fields: FormField[]
  active: boolean
  created_at: string
  updated_at: string
}

export interface Contact {
  _id?: string
  name: string
  organization?: string
  email: string
  phone?: string
  topic?: string
  message: string
  status: "new" | "read" | "replied" | "archived"
  created_at: string
}

export interface StaffPermissions {
  create: boolean
  read: boolean
  update: boolean
  delete: boolean
}

export interface Staff {
  _id?: string
  username: string
  email: string
  full_name: string
  password_hash: string
  role: "admin" | "staff"
  permissions: StaffPermissions
  active: boolean
  created_at: string
  updated_at?: string
}

export interface ImageFile {
  _id?: string
  filename: string
  mime: string
  size: number
  bytes_base64: string
  created_at: string
}

const sql = postgres(process.env.DATABASE_URL || "", {
  max: 10,
  prepare: false,
})

let schemaPromise: Promise<void> | null = null

async function ensureSchema() {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      await sql.unsafe(`
        CREATE TABLE IF NOT EXISTS images (
          id text PRIMARY KEY,
          filename text NOT NULL,
          mime text NOT NULL,
          size integer NOT NULL,
          bytes bytea NOT NULL,
          created_at timestamptz NOT NULL
        );
        CREATE TABLE IF NOT EXISTS content (
          id text PRIMARY KEY,
          numeric_id text,
          type text NOT NULL,
          title text NOT NULL,
          slug text NOT NULL,
          description text NOT NULL DEFAULT '',
          body text NOT NULL DEFAULT '',
          icon text NOT NULL DEFAULT 'briefcase',
          image_id text REFERENCES images(id) ON DELETE SET NULL,
          image_mime text,
          document_id text REFERENCES images(id) ON DELETE SET NULL,
          document_name text,
          document_mime text,
          meta jsonb NOT NULL DEFAULT '{}'::jsonb,
          sort_order integer NOT NULL DEFAULT 0,
          active boolean NOT NULL DEFAULT true,
          created_at timestamptz NOT NULL,
          updated_at timestamptz NOT NULL
        );
        CREATE TABLE IF NOT EXISTS applications (
          id text PRIMARY KEY,
          career_id text,
          career_title text,
          form_id text,
          form_title text,
          custom_answers jsonb NOT NULL DEFAULT '{}'::jsonb,
          full_name text NOT NULL,
          email text NOT NULL,
          phone text NOT NULL DEFAULT '',
          link text NOT NULL DEFAULT '',
          cover_note text NOT NULL,
          resume_id text,
          resume_name text,
          resume_mime text,
          status text NOT NULL,
          created_at timestamptz NOT NULL
        );
        CREATE TABLE IF NOT EXISTS contacts (
          id text PRIMARY KEY,
          name text NOT NULL,
          organization text NOT NULL DEFAULT '',
          email text NOT NULL,
          phone text NOT NULL DEFAULT '',
          topic text NOT NULL DEFAULT '',
          message text NOT NULL,
          status text NOT NULL,
          created_at timestamptz NOT NULL
        );
        CREATE TABLE IF NOT EXISTS staff (
          id text PRIMARY KEY,
          username text NOT NULL UNIQUE,
          email text NOT NULL,
          full_name text NOT NULL,
          password_hash text NOT NULL,
          role text NOT NULL,
          permissions jsonb NOT NULL,
          active boolean NOT NULL DEFAULT true,
          created_at timestamptz NOT NULL,
          updated_at timestamptz NOT NULL
        );
        CREATE TABLE IF NOT EXISTS recruitment_forms (
          id text PRIMARY KEY,
          title text NOT NULL,
          code text NOT NULL,
          description text NOT NULL DEFAULT '',
          category text NOT NULL DEFAULT 'General',
          career_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
          fields jsonb NOT NULL DEFAULT '[]'::jsonb,
          active boolean NOT NULL DEFAULT true,
          created_at timestamptz NOT NULL,
          updated_at timestamptz NOT NULL
        );
        ALTER TABLE applications ADD COLUMN IF NOT EXISTS career_title text;
        ALTER TABLE applications ADD COLUMN IF NOT EXISTS form_id text;
        ALTER TABLE applications ADD COLUMN IF NOT EXISTS form_title text;
        ALTER TABLE applications ADD COLUMN IF NOT EXISTS custom_answers jsonb NOT NULL DEFAULT '{}'::jsonb;
        ALTER TABLE applications ADD COLUMN IF NOT EXISTS phone text NOT NULL DEFAULT '';
        ALTER TABLE applications ADD COLUMN IF NOT EXISTS link text NOT NULL DEFAULT '';
        ALTER TABLE applications ADD COLUMN IF NOT EXISTS resume_id text;
        ALTER TABLE applications ADD COLUMN IF NOT EXISTS resume_name text;
        ALTER TABLE applications ADD COLUMN IF NOT EXISTS resume_mime text;
        ALTER TABLE applications DROP CONSTRAINT IF EXISTS fk_applications_career;
        ALTER TABLE applications ALTER COLUMN id TYPE text USING id::text;
        ALTER TABLE applications ALTER COLUMN career_id TYPE text USING career_id::text;
        ALTER TABLE contacts ALTER COLUMN id TYPE text USING id::text;
        CREATE INDEX IF NOT EXISTS content_type_active_sort_idx ON content(type, active, sort_order);
        CREATE INDEX IF NOT EXISTS applications_created_idx ON applications(created_at DESC);
        CREATE INDEX IF NOT EXISTS contacts_created_idx ON contacts(created_at DESC);
        CREATE INDEX IF NOT EXISTS forms_created_idx ON recruitment_forms(created_at DESC);
      `)
    })()
  }
  await schemaPromise
}

function iso(value: string | Date) {
  return new Date(value).toISOString()
}

function idOf(value: unknown) {
  return String(value || crypto.randomUUID())
}

function fromContent(row: any): ContentItem {
  return {
    _id: row.id,
    id: row.numeric_id ?? undefined,
    type: row.type,
    title: row.title,
    slug: row.slug,
    description: row.description,
    body: row.body,
    icon: row.icon,
    image_id: row.image_id,
    image_mime: row.image_mime,
    document_id: row.document_id,
    document_name: row.document_name,
    document_mime: row.document_mime,
    meta: row.meta,
    sort_order: row.sort_order,
    active: row.active,
    created_at: iso(row.created_at),
    updated_at: iso(row.updated_at),
  }
}

async function ready() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured")
  await ensureSchema()
}

export async function getContentList(type: string, includeInactive = false): Promise<ContentItem[]> {
  await ready()
  const rows = includeInactive
    ? await sql`SELECT * FROM content WHERE type = ${type} ORDER BY sort_order ASC`
    : await sql`SELECT * FROM content WHERE type = ${type} AND active = true ORDER BY sort_order ASC`
  return rows.map(fromContent)
}

export async function getContentById(id: string): Promise<ContentItem | null> {
  await ready()
  const rows = await sql`SELECT * FROM content WHERE id = ${id} LIMIT 1`
  if (rows.length) return fromContent(rows[0])
  const numeric = Number(id)
  if (!Number.isNaN(numeric)) {
    const fallback = await sql`SELECT * FROM content WHERE numeric_id = ${String(numeric)} LIMIT 1`
    return fallback.length ? fromContent(fallback[0]) : null
  }
  return null
}

export async function createContentItem(itemData: Partial<ContentItem>): Promise<ContentItem> {
  await ready()
  const now = new Date().toISOString()
  const title = itemData.title || "Untitled"
  const slug = itemData.slug || title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `item-${Date.now()}`
  const id = idOf(itemData._id)
  const rows = await sql`
    INSERT INTO content (id, numeric_id, type, title, slug, description, body, icon, image_id, image_mime, document_id, document_name, document_mime, meta, sort_order, active, created_at, updated_at)
    VALUES (${id}, ${itemData.id == null ? null : String(itemData.id)}, ${itemData.type || "service"}, ${title}, ${slug}, ${itemData.description || ""}, ${itemData.body || ""}, ${itemData.icon || "briefcase"}, ${itemData.image_id || null}, ${itemData.image_mime || null}, ${itemData.document_id || null}, ${itemData.document_name || null}, ${itemData.document_mime || null}, ${sql.json((itemData.meta || {}) as any)}, ${Number(itemData.sort_order || 0)}, ${itemData.active !== false}, ${now}, ${now})
    RETURNING *
  `
  return fromContent(rows[0])
}

export async function updateContentItem(id: string, updates: Partial<ContentItem>): Promise<ContentItem | null> {
  await ready()
  const existing = await getContentById(id)
  if (!existing?._id) return null
  const values: Record<string, unknown> = { ...updates, updated_at: new Date().toISOString() }
  if (updates.title && !updates.slug) {
    values.slug = updates.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
  }
  delete values._id
  delete values.id
  const allowed = ["type", "title", "slug", "description", "body", "icon", "image_id", "image_mime", "document_id", "document_name", "document_mime", "sort_order", "active", "updated_at"]
  for (const key of allowed) {
    if (!(key in values)) continue
    const value = values[key]
    await sql.unsafe(`UPDATE content SET ${key} = $1 WHERE id = $2`, [value as any, existing._id])
  }
  if ("meta" in values) await sql`UPDATE content SET meta = ${sql.json((values.meta || {}) as any)} WHERE id = ${existing._id}`
  return getContentById(existing._id)
}

export async function deleteContentItem(id: string): Promise<boolean> {
  await ready()
  const result = await sql`DELETE FROM content WHERE id = ${id} RETURNING id`
  return result.length > 0
}

export async function getApplications(): Promise<Application[]> {
  await ready()
  return (await sql`SELECT * FROM applications ORDER BY created_at DESC`).map((row) => ({ ...row, _id: row.id })) as Application[]
}

export async function createApplication(data: {
  career_id?: string | number
  career_title?: string
  form_id?: string | null
  form_title?: string | null
  custom_answers?: Record<string, any>
  full_name: string
  email: string
  phone?: string
  link?: string
  cover_note: string
  resume_id?: string | null
  resume_name?: string | null
  resume_mime?: string | null
}): Promise<Application> {
  await ready()
  const id = idOf(undefined)
  const rows = await sql`
    INSERT INTO applications (id, career_id, career_title, form_id, form_title, custom_answers, full_name, email, phone, link, cover_note, resume_id, resume_name, resume_mime, status, created_at)
    VALUES (${id}, ${data.career_id == null ? null : String(data.career_id)}, ${data.career_title || null}, ${data.form_id || null}, ${data.form_title || null}, ${sql.json(data.custom_answers || {})}, ${data.full_name}, ${data.email}, ${data.phone || ""}, ${data.link || ""}, ${data.cover_note}, ${data.resume_id || null}, ${data.resume_name || null}, ${data.resume_mime || null}, 'new', ${new Date().toISOString()})
    RETURNING *
  `
  return { ...rows[0]!, _id: rows[0]!.id } as Application
}

export async function updateApplicationStatus(id: string, status: Application["status"]): Promise<boolean> {
  await ready()
  return (await sql`UPDATE applications SET status = ${status} WHERE id = ${id} RETURNING id`).length > 0
}

export async function deleteApplication(id: string): Promise<boolean> {
  await ready()
  return (await sql`DELETE FROM applications WHERE id = ${id} RETURNING id`).length > 0
}

export async function getContacts(): Promise<Contact[]> {
  await ready()
  return (await sql`SELECT * FROM contacts ORDER BY created_at DESC`).map((row) => ({ ...row, _id: row.id })) as Contact[]
}

export async function createContact(data: {
  name: string
  organization?: string
  email: string
  phone?: string
  topic?: string
  message: string
}): Promise<Contact> {
  await ready()
  const rows = await sql`
    INSERT INTO contacts (id, name, organization, email, phone, topic, message, status, created_at)
    VALUES (${idOf(undefined)}, ${data.name}, ${data.organization || ""}, ${data.email}, ${data.phone || ""}, ${data.topic || ""}, ${data.message}, 'new', ${new Date().toISOString()})
    RETURNING *
  `
  return { ...rows[0]!, _id: rows[0]!.id } as Contact
}

export async function updateContactStatus(id: string, status: Contact["status"]): Promise<boolean> {
  await ready()
  return (await sql`UPDATE contacts SET status = ${status} WHERE id = ${id} RETURNING id`).length > 0
}

export async function deleteContact(id: string): Promise<boolean> {
  await ready()
  return (await sql`DELETE FROM contacts WHERE id = ${id} RETURNING id`).length > 0
}

export async function getStaffList(): Promise<Omit<Staff, "password_hash">[]> {
  await ready()
  const rows = await sql`SELECT * FROM staff ORDER BY created_at DESC`
  return rows.map(({ password_hash, ...staff }) => ({ ...staff, _id: staff.id })) as Omit<Staff, "password_hash">[]
}

export async function getStaffByUsername(username: string): Promise<Staff | null> {
  await ready()
  const rows = await sql`SELECT * FROM staff WHERE lower(username) = ${username.toLowerCase().trim()} OR lower(email) = ${username.toLowerCase().trim()} LIMIT 1`
  return (rows[0] ? { ...rows[0], _id: rows[0].id } : null) as Staff | null
}

export async function getStaffById(id: string): Promise<Staff | null> {
  await ready()
  const rows = await sql`SELECT * FROM staff WHERE id = ${id} LIMIT 1`
  return (rows[0] ? { ...rows[0], _id: rows[0].id } : null) as Staff | null
}

export async function createStaffMember(data: {
  username: string
  email: string
  full_name: string
  password: string
  role?: "admin" | "staff"
  permissions?: Partial<StaffPermissions>
}): Promise<Omit<Staff, "password_hash">> {
  await ready()
  const username = data.username.toLowerCase().trim()
  if (await getStaffByUsername(username)) throw new Error(`Username "${username}" already exists`)
  const role = data.role || "staff"
  const permissions: StaffPermissions = role === "admin"
    ? { create: true, read: true, update: true, delete: true }
    : { create: Boolean(data.permissions?.create), read: data.permissions?.read !== false, update: Boolean(data.permissions?.update), delete: Boolean(data.permissions?.delete) }
  const now = new Date().toISOString()
  const rows = await sql`
    INSERT INTO staff (id, username, email, full_name, password_hash, role, permissions, active, created_at, updated_at)
    VALUES (${idOf(undefined)}, ${username}, ${data.email.trim()}, ${data.full_name.trim()}, ${await argon2.hash(data.password, { type: argon2.argon2id })}, ${role}, ${sql.json(permissions as any)}, true, ${now}, ${now})
    RETURNING *
  `
  const { password_hash, ...safeStaff } = { ...rows[0]!, _id: rows[0]!.id } as Staff
  return safeStaff
}

export async function updateStaffMember(id: string, updates: {
  email?: string
  full_name?: string
  password?: string
  role?: "admin" | "staff"
  permissions?: Partial<StaffPermissions>
  active?: boolean
}): Promise<Omit<Staff, "password_hash"> | null> {
  await ready()
  const staff = await getStaffById(id)
  if (!staff) return null
  const values: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (updates.email) values.email = updates.email.trim()
  if (updates.full_name) values.full_name = updates.full_name.trim()
  if (updates.active !== undefined) values.active = updates.active
  if (updates.role) values.role = updates.role
  if (updates.password?.trim()) values.password_hash = await argon2.hash(updates.password.trim(), { type: argon2.argon2id })
  if (updates.permissions) values.permissions = { ...staff.permissions, ...updates.permissions }
  for (const [key, value] of Object.entries(values)) {
    if (key === "permissions") await sql`UPDATE staff SET permissions = ${sql.json(value as any)} WHERE id = ${id}`
    else await sql.unsafe(`UPDATE staff SET ${key} = $1 WHERE id = $2`, [value as any, id])
  }
  const fresh = await getStaffById(id)
  if (!fresh) return null
  const { password_hash, ...safeStaff } = fresh
  return safeStaff
}

export async function deleteStaffMember(id: string): Promise<boolean> {
  await ready()
  return (await sql`DELETE FROM staff WHERE id = ${id} RETURNING id`).length > 0
}

export async function saveImageBytes(filename: string, mime: string, buffer: Buffer): Promise<string> {
  await ready()
  const id = idOf(undefined)
  await sql`INSERT INTO images (id, filename, mime, size, bytes, created_at) VALUES (${id}, ${filename}, ${mime}, ${buffer.length}, ${buffer}, ${new Date().toISOString()})`
  return id
}

export async function getImageBytes(id: string): Promise<{ buffer: Buffer; mime: string; filename: string; size: number } | null> {
  await ready()
  const rows = await sql`SELECT filename, mime, size, bytes FROM images WHERE id = ${id} LIMIT 1`
  if (!rows.length) return null
  const row = rows[0]!
  return { buffer: Buffer.from(row.bytes), mime: row.mime || "image/jpeg", filename: row.filename || "image", size: row.size || 0 }
}

export async function getRecruitmentForms(includeInactive = false): Promise<RecruitmentForm[]> {
  await ready()
  const rows = includeInactive
    ? await sql`SELECT * FROM recruitment_forms ORDER BY created_at DESC`
    : await sql`SELECT * FROM recruitment_forms WHERE active = true ORDER BY created_at DESC`
  return rows.map((row) => ({ ...row, _id: row.id, career_ids: row.career_ids, fields: row.fields, created_at: iso(row.created_at), updated_at: iso(row.updated_at) })) as RecruitmentForm[]
}

export async function getRecruitmentFormById(id: string): Promise<RecruitmentForm | null> {
  await ready()
  const rows = await sql`SELECT * FROM recruitment_forms WHERE id = ${id} LIMIT 1`
  return rows.length ? ({ ...rows[0]!, _id: rows[0]!.id, career_ids: rows[0]!.career_ids, fields: rows[0]!.fields, created_at: iso(rows[0]!.created_at), updated_at: iso(rows[0]!.updated_at) } as RecruitmentForm) : null
}

export async function createRecruitmentForm(formData: Partial<RecruitmentForm>): Promise<RecruitmentForm> {
  await ready()
  const now = new Date().toISOString()
  const rows = await sql`
    INSERT INTO recruitment_forms (id, title, code, description, category, career_ids, fields, active, created_at, updated_at)
    VALUES (${idOf(undefined)}, ${formData.title || "Untitled Recruitment Form"}, ${(formData.code || `FORM-${Date.now().toString().slice(-4)}`).toUpperCase().trim()}, ${formData.description || ""}, ${formData.category || "General"}, ${sql.json((formData.career_ids || []) as any)}, ${sql.json((formData.fields || []) as any)}, ${formData.active !== false}, ${now}, ${now})
    RETURNING *
  `
  return { ...rows[0]!, _id: rows[0]!.id } as RecruitmentForm
}

export async function updateRecruitmentForm(id: string, updates: Partial<RecruitmentForm>): Promise<RecruitmentForm | null> {
  await ready()
  const existing = await getRecruitmentFormById(id)
  if (!existing) return null
  const values = { ...updates, updated_at: new Date().toISOString() } as Record<string, unknown>
  delete values._id
  delete values.id
  for (const key of ["title", "description", "category", "active", "updated_at"]) {
    if (key in values) await sql.unsafe(`UPDATE recruitment_forms SET ${key} = $1 WHERE id = $2`, [values[key] as any, id])
  }
  if (values.code) await sql`UPDATE recruitment_forms SET code = ${String(values.code).toUpperCase().trim()} WHERE id = ${id}`
  if (values.career_ids) await sql`UPDATE recruitment_forms SET career_ids = ${sql.json(values.career_ids as any)} WHERE id = ${id}`
  if (values.fields) await sql`UPDATE recruitment_forms SET fields = ${sql.json(values.fields as any)} WHERE id = ${id}`
  return getRecruitmentFormById(id)
}

export async function deleteRecruitmentForm(id: string): Promise<boolean> {
  await ready()
  return (await sql`DELETE FROM recruitment_forms WHERE id = ${id} RETURNING id`).length > 0
}

export default { ready }
