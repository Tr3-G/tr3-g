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

export interface GalleryItem {
  _id?: string
  id?: string
  title: string
  description?: string
  media_url: string
  media_type: "image" | "video"
  public_id?: string | null
  is_public: boolean
  file_size?: number
  mime_type?: string
  sort_order?: number
  created_at: string
  updated_at: string
}

export interface Guarantor {
  full_name: string
  email: string
  phone: string
  passport_url?: string
  address: string
}

export interface BioData {
  _id?: string
  id?: string
  staff_uid: string
  first_name: string
  last_name: string
  other_name?: string
  email: string
  phone_number: string
  phone_number_2?: string
  marital_status: string
  date_of_birth: string
  gender: string
  passport_url?: string

  state_of_origin: string
  lga_of_origin: string
  current_state_of_residence: string
  current_lga_of_residence: string
  current_residence_address: string
  country: string
  disability?: string

  guarantor_1: Guarantor
  guarantor_2: Guarantor

  identification_nin: string
  id_card_front_url?: string
  id_card_back_url?: string

  designation: string
  company_email?: string
  department: string
  idcard: boolean
  reference?: string
  workstation: string

  status: "pending" | "verified" | "active" | "archived"
  created_at: string
  updated_at: string
}

export interface AttendanceRecord {
  id: string
  _id?: string
  staff_id: string
  staff_uid: string
  staff_name: string
  designation: string
  department: string
  passport: string
  date: string
  check_in_time: string
  check_out_time: string | null
  duration_minutes: number
  status: "checked_in" | "completed" | "present" | string
  notes?: string
  workstation?: string
  created_at: string
  updated_at: string
}

export interface StaffReport {
  id: string
  _id?: string
  staff_uid: string
  staff_name: string
  workstation: string
  email: string
  title: string
  body: string
  file_url: string
  file_name?: string
  file_type?: string
  status: "pending" | "reviewed" | "approved" | "rejected" | string
  approved_by?: string
  approved_by_id?: string
  approved_at?: string | null
  admin_notes?: string
  created_at: string
  updated_at: string
}

export interface AuditLogEntry {
  id: string
  _id?: string
  actor_id: string
  actor_name: string
  actor_role: string
  action: string
  resource: string
  resource_id?: string
  details: string
  ip_address?: string
  user_agent?: string
  status: "success" | "failure" | "warning" | string
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
        CREATE TABLE IF NOT EXISTS gallery (
          id text PRIMARY KEY,
          title text NOT NULL,
          description text NOT NULL DEFAULT '',
          media_url text NOT NULL,
          media_type text NOT NULL DEFAULT 'image',
          public_id text,
          is_public boolean NOT NULL DEFAULT true,
          file_size integer NOT NULL DEFAULT 0,
          mime_type text NOT NULL DEFAULT '',
          sort_order integer NOT NULL DEFAULT 0,
          created_at timestamptz NOT NULL,
          updated_at timestamptz NOT NULL
        );
        CREATE TABLE IF NOT EXISTS biodata (
          id text PRIMARY KEY,
          staff_uid text NOT NULL UNIQUE,
          first_name text NOT NULL,
          last_name text NOT NULL,
          other_name text NOT NULL DEFAULT '',
          email text NOT NULL,
          phone_number text NOT NULL,
          phone_number_2 text NOT NULL DEFAULT '',
          marital_status text NOT NULL DEFAULT 'Single',
          date_of_birth text NOT NULL,
          gender text NOT NULL DEFAULT 'Male',
          passport_url text NOT NULL DEFAULT '',
          state_of_origin text NOT NULL DEFAULT '',
          lga_of_origin text NOT NULL DEFAULT '',
          current_state_of_residence text NOT NULL DEFAULT '',
          current_lga_of_residence text NOT NULL DEFAULT '',
          current_residence_address text NOT NULL DEFAULT '',
          country text NOT NULL DEFAULT 'Nigeria',
          disability text NOT NULL DEFAULT 'None',
          guarantor_1 jsonb NOT NULL DEFAULT '{}'::jsonb,
          guarantor_2 jsonb NOT NULL DEFAULT '{}'::jsonb,
          identification_nin text NOT NULL DEFAULT '',
          id_card_front_url text NOT NULL DEFAULT '',
          id_card_back_url text NOT NULL DEFAULT '',
          designation text NOT NULL DEFAULT '',
          company_email text NOT NULL DEFAULT '',
          department text NOT NULL DEFAULT '',
          idcard boolean NOT NULL DEFAULT false,
          reference text NOT NULL DEFAULT '',
          workstation text NOT NULL DEFAULT '',
          status text NOT NULL DEFAULT 'pending',
          created_at timestamptz NOT NULL,
          updated_at timestamptz NOT NULL
        );
        CREATE INDEX IF NOT EXISTS biodata_created_idx ON biodata(created_at DESC);
        CREATE INDEX IF NOT EXISTS biodata_staff_uid_idx ON biodata(staff_uid);
        CREATE TABLE IF NOT EXISTS attendance (
          id text PRIMARY KEY,
          staff_id text NOT NULL DEFAULT '',
          staff_uid text NOT NULL,
          staff_name text NOT NULL DEFAULT '',
          designation text NOT NULL DEFAULT '',
          department text NOT NULL DEFAULT '',
          passport text NOT NULL DEFAULT '',
          date text NOT NULL,
          check_in_time timestamptz NOT NULL,
          check_out_time timestamptz,
          duration_minutes integer NOT NULL DEFAULT 0,
          status text NOT NULL DEFAULT 'checked_in',
          notes text NOT NULL DEFAULT '',
          workstation text NOT NULL DEFAULT '',
          created_at timestamptz NOT NULL,
          updated_at timestamptz NOT NULL
        );
        CREATE INDEX IF NOT EXISTS attendance_date_idx ON attendance(date DESC);
        CREATE INDEX IF NOT EXISTS attendance_staff_uid_idx ON attendance(staff_uid);
        CREATE INDEX IF NOT EXISTS attendance_created_idx ON attendance(created_at DESC);
        CREATE TABLE IF NOT EXISTS reports (
          id text PRIMARY KEY,
          staff_uid text NOT NULL,
          staff_name text NOT NULL DEFAULT '',
          workstation text NOT NULL DEFAULT '',
          email text NOT NULL,
          title text NOT NULL,
          body text NOT NULL,
          file_url text NOT NULL DEFAULT '',
          file_name text NOT NULL DEFAULT '',
          file_type text NOT NULL DEFAULT '',
          status text NOT NULL DEFAULT 'pending',
          approved_by text NOT NULL DEFAULT '',
          approved_by_id text NOT NULL DEFAULT '',
          approved_at timestamptz,
          admin_notes text NOT NULL DEFAULT '',
          created_at timestamptz NOT NULL,
          updated_at timestamptz NOT NULL
        );
        CREATE INDEX IF NOT EXISTS reports_created_idx ON reports(created_at DESC);
        CREATE INDEX IF NOT EXISTS reports_staff_uid_idx ON reports(staff_uid);
        CREATE INDEX IF NOT EXISTS reports_status_idx ON reports(status);
        CREATE TABLE IF NOT EXISTS audit_logs (
          id text PRIMARY KEY,
          actor_id text NOT NULL DEFAULT '',
          actor_name text NOT NULL DEFAULT '',
          actor_role text NOT NULL DEFAULT '',
          action text NOT NULL,
          resource text NOT NULL,
          resource_id text NOT NULL DEFAULT '',
          details text NOT NULL DEFAULT '',
          ip_address text NOT NULL DEFAULT '',
          user_agent text NOT NULL DEFAULT '',
          status text NOT NULL DEFAULT 'success',
          created_at timestamptz NOT NULL
        );
        CREATE INDEX IF NOT EXISTS audit_logs_created_idx ON audit_logs(created_at DESC);
        CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON audit_logs(action);
        CREATE INDEX IF NOT EXISTS audit_logs_resource_idx ON audit_logs(resource);
        CREATE INDEX IF NOT EXISTS audit_logs_actor_idx ON audit_logs(actor_name);
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
        CREATE INDEX IF NOT EXISTS gallery_created_idx ON gallery(created_at DESC);
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

export async function getApplicationById(id: string): Promise<Application | null> {
  await ready()
  const rows = await sql`SELECT * FROM applications WHERE id = ${id} LIMIT 1`
  if (!rows.length) return null
  return { ...rows[0]!, _id: rows[0]!.id } as Application
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

function fromGallery(row: any): GalleryItem {
  return {
    _id: row.id,
    id: row.id,
    title: row.title,
    description: row.description,
    media_url: row.media_url,
    media_type: row.media_type,
    public_id: row.public_id,
    is_public: row.is_public,
    file_size: row.file_size,
    mime_type: row.mime_type,
    sort_order: row.sort_order,
    created_at: iso(row.created_at),
    updated_at: iso(row.updated_at),
  }
}

export async function getGalleryItems(includePrivate = false): Promise<GalleryItem[]> {
  await ready()
  const rows = includePrivate
    ? await sql`SELECT * FROM gallery ORDER BY sort_order ASC, created_at DESC`
    : await sql`SELECT * FROM gallery WHERE is_public = true ORDER BY sort_order ASC, created_at DESC`
  return rows.map(fromGallery)
}

export async function getGalleryItemById(id: string): Promise<GalleryItem | null> {
  await ready()
  const rows = await sql`SELECT * FROM gallery WHERE id = ${id} LIMIT 1`
  return rows.length ? fromGallery(rows[0]) : null
}

export async function createGalleryItem(data: Partial<GalleryItem>): Promise<GalleryItem> {
  await ready()
  const now = new Date().toISOString()
  const id = idOf(data._id || data.id)
  const rows = await sql`
    INSERT INTO gallery (id, title, description, media_url, media_type, public_id, is_public, file_size, mime_type, sort_order, created_at, updated_at)
    VALUES (
      ${id},
      ${data.title || "Untitled Media"},
      ${data.description || ""},
      ${data.media_url || ""},
      ${data.media_type || "image"},
      ${data.public_id || null},
      ${data.is_public !== false},
      ${Number(data.file_size || 0)},
      ${data.mime_type || ""},
      ${Number(data.sort_order || 0)},
      ${now},
      ${now}
    )
    RETURNING *
  `
  return fromGallery(rows[0])
}

export async function updateGalleryItem(id: string, updates: Partial<GalleryItem>): Promise<GalleryItem | null> {
  await ready()
  const existing = await getGalleryItemById(id)
  if (!existing) return null
  const values = { ...updates, updated_at: new Date().toISOString() } as Record<string, unknown>
  delete values._id
  delete values.id
  for (const key of ["title", "description", "media_url", "media_type", "public_id", "is_public", "file_size", "mime_type", "sort_order", "updated_at"]) {
    if (key in values) {
      await sql.unsafe(`UPDATE gallery SET ${key} = $1 WHERE id = $2`, [values[key] as any, id])
    }
  }
  return getGalleryItemById(id)
}

export async function deleteGalleryItem(id: string): Promise<boolean> {
  await ready()
  return (await sql`DELETE FROM gallery WHERE id = ${id} RETURNING id`).length > 0
}

export function generateStaffUid(): string {
  const randomSuffix = Math.floor(100000 + Math.random() * 900000)
  return `TR3G-STF-${randomSuffix}`
}

function fromBioData(row: any): BioData {
  return {
    _id: row.id,
    id: row.id,
    staff_uid: row.staff_uid,
    first_name: row.first_name,
    last_name: row.last_name,
    other_name: row.other_name,
    email: row.email,
    phone_number: row.phone_number,
    phone_number_2: row.phone_number_2,
    marital_status: row.marital_status,
    date_of_birth: row.date_of_birth,
    gender: row.gender,
    passport_url: row.passport_url,
    state_of_origin: row.state_of_origin,
    lga_of_origin: row.lga_of_origin,
    current_state_of_residence: row.current_state_of_residence,
    current_lga_of_residence: row.current_lga_of_residence,
    current_residence_address: row.current_residence_address,
    country: row.country,
    disability: row.disability,
    guarantor_1: row.guarantor_1 || {},
    guarantor_2: row.guarantor_2 || {},
    identification_nin: row.identification_nin,
    id_card_front_url: row.id_card_front_url,
    id_card_back_url: row.id_card_back_url,
    designation: row.designation,
    company_email: row.company_email,
    department: row.department,
    idcard: Boolean(row.idcard),
    reference: row.reference,
    workstation: row.workstation,
    status: row.status,
    created_at: iso(row.created_at),
    updated_at: iso(row.updated_at),
  }
}

export async function getBioDataList(): Promise<BioData[]> {
  await ready()
  const rows = await sql`SELECT * FROM biodata ORDER BY created_at DESC`
  return rows.map(fromBioData)
}

export async function getBioDataById(id: string): Promise<BioData | null> {
  await ready()
  const rows = await sql`SELECT * FROM biodata WHERE id = ${id} LIMIT 1`
  return rows.length ? fromBioData(rows[0]) : null
}

export async function getBioDataByUid(staffUid: string): Promise<BioData | null> {
  await ready()
  const rows = await sql`SELECT * FROM biodata WHERE lower(staff_uid) = ${staffUid.toLowerCase().trim()} LIMIT 1`
  return rows.length ? fromBioData(rows[0]) : null
}

export async function createBioData(data: Partial<BioData>): Promise<BioData> {
  await ready()
  const now = new Date().toISOString()
  const id = idOf(data._id || data.id)
  const staffUid = data.staff_uid || generateStaffUid()

  const rows = await sql`
    INSERT INTO biodata (
      id, staff_uid, first_name, last_name, other_name, email, phone_number, phone_number_2,
      marital_status, date_of_birth, gender, passport_url,
      state_of_origin, lga_of_origin, current_state_of_residence, current_lga_of_residence,
      current_residence_address, country, disability,
      guarantor_1, guarantor_2,
      identification_nin, id_card_front_url, id_card_back_url,
      designation, company_email, department, idcard, reference, workstation,
      status, created_at, updated_at
    ) VALUES (
      ${id},
      ${staffUid},
      ${data.first_name || ""},
      ${data.last_name || ""},
      ${data.other_name || ""},
      ${data.email || ""},
      ${data.phone_number || ""},
      ${data.phone_number_2 || ""},
      ${data.marital_status || "Single"},
      ${data.date_of_birth || ""},
      ${data.gender || "Male"},
      ${data.passport_url || ""},
      ${data.state_of_origin || ""},
      ${data.lga_of_origin || ""},
      ${data.current_state_of_residence || ""},
      ${data.current_lga_of_residence || ""},
      ${data.current_residence_address || ""},
      ${data.country || "Nigeria"},
      ${data.disability || "None"},
      ${sql.json((data.guarantor_1 || {}) as any)},
      ${sql.json((data.guarantor_2 || {}) as any)},
      ${data.identification_nin || ""},
      ${data.id_card_front_url || ""},
      ${data.id_card_back_url || ""},
      ${data.designation || ""},
      ${data.company_email || ""},
      ${data.department || ""},
      ${Boolean(data.idcard)},
      ${data.reference || ""},
      ${data.workstation || ""},
      ${data.status || "pending"},
      ${now},
      ${now}
    )
    RETURNING *
  `
  return fromBioData(rows[0])
}

export async function updateBioData(id: string, updates: Partial<BioData>): Promise<BioData | null> {
  await ready()
  const existing = await getBioDataById(id)
  if (!existing) return null
  const values = { ...updates, updated_at: new Date().toISOString() } as Record<string, unknown>
  delete values._id
  delete values.id

  for (const key of [
    "first_name", "last_name", "other_name", "email", "phone_number", "phone_number_2",
    "marital_status", "date_of_birth", "gender", "passport_url",
    "state_of_origin", "lga_of_origin", "current_state_of_residence", "current_lga_of_residence",
    "current_residence_address", "country", "disability",
    "identification_nin", "id_card_front_url", "id_card_back_url",
    "designation", "company_email", "department", "idcard", "reference", "workstation",
    "status", "updated_at"
  ]) {
    if (key in values) {
      await sql.unsafe(`UPDATE biodata SET ${key} = $1 WHERE id = $2`, [values[key] as any, id])
    }
  }

  if ("guarantor_1" in values) {
    await sql`UPDATE biodata SET guarantor_1 = ${sql.json((values.guarantor_1 || {}) as any)} WHERE id = ${id}`
  }
  if ("guarantor_2" in values) {
    await sql`UPDATE biodata SET guarantor_2 = ${sql.json((values.guarantor_2 || {}) as any)} WHERE id = ${id}`
  }

  return getBioDataById(id)
}

export async function deleteBioData(id: string): Promise<boolean> {
  await ready()
  return (await sql`DELETE FROM biodata WHERE id = ${id} RETURNING id`).length > 0
}

function fromAttendance(row: any): AttendanceRecord {
  return {
    id: row.id,
    _id: row.id,
    staff_id: row.staff_id || "",
    staff_uid: row.staff_uid || "",
    staff_name: row.staff_name || "",
    designation: row.designation || "",
    department: row.department || "",
    passport: row.passport || "",
    date: row.date,
    check_in_time: row.check_in_time ? new Date(row.check_in_time).toISOString() : "",
    check_out_time: row.check_out_time ? new Date(row.check_out_time).toISOString() : null,
    duration_minutes: row.duration_minutes || 0,
    status: row.status || "checked_in",
    notes: row.notes || "",
    workstation: row.workstation || "",
    created_at: iso(row.created_at),
    updated_at: iso(row.updated_at),
  }
}

export function getTodayDateString(d: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Africa/Lagos",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    return formatter.format(d)
  } catch {
    return d.toISOString().slice(0, 10)
  }
}

export async function lookupStaffForAttendance(query: string): Promise<BioData | null> {
  await ready()
  const raw = query.trim()
  if (!raw) return null
  const upper = raw.toUpperCase()
  const prefixed = upper.startsWith("TR3G-STF-") ? upper : `TR3G-STF-${upper}`

  const rows = await sql`
    SELECT * FROM biodata 
    WHERE UPPER(TRIM(staff_uid)) = ${upper}
       OR UPPER(TRIM(staff_uid)) = ${prefixed}
       OR UPPER(TRIM(email)) = ${upper}
       OR UPPER(TRIM(company_email)) = ${upper}
       OR TRIM(identification_nin) = ${raw}
       OR id = ${raw}
    ORDER BY created_at DESC
    LIMIT 1
  `
  if (rows.length > 0) {
    return fromBioData(rows[0])
  }
  return null
}

export async function getTodayAttendance(staffUid: string, dateStr?: string): Promise<AttendanceRecord | null> {
  await ready()
  const targetDate = dateStr || getTodayDateString()
  const upper = staffUid.trim().toUpperCase()
  const prefixed = upper.startsWith("TR3G-STF-") ? upper : `TR3G-STF-${upper}`

  const rows = await sql`
    SELECT * FROM attendance
    WHERE (UPPER(TRIM(staff_uid)) = ${upper} OR UPPER(TRIM(staff_uid)) = ${prefixed})
      AND date = ${targetDate}
    ORDER BY created_at DESC
    LIMIT 1
  `
  if (rows.length > 0) {
    return fromAttendance(rows[0])
  }
  return null
}

export async function checkInStaff(params: {
  staff_uid: string
  staff_id?: string
  staff_name?: string
  designation?: string
  department?: string
  passport?: string
  workstation?: string
  notes?: string
}): Promise<{ attendance: AttendanceRecord; alreadyCheckedIn: boolean }> {
  await ready()
  const todayStr = getTodayDateString()
  const existing = await getTodayAttendance(params.staff_uid, todayStr)
  if (existing) {
    return { attendance: existing, alreadyCheckedIn: true }
  }

  let { staff_id, staff_name, designation, department, passport, workstation } = params
  if (!staff_name || !passport) {
    const bio = await lookupStaffForAttendance(params.staff_uid)
    if (bio) {
      staff_id = staff_id || bio.id
      staff_name = staff_name || `${bio.first_name} ${bio.last_name} ${bio.other_name || ""}`.trim()
      designation = designation || bio.designation
      department = department || bio.department
      passport = passport || bio.passport_url
      workstation = workstation || bio.workstation
    }
  }

  const id = crypto.randomUUID()
  const now = new Date()

  const rows = await sql`
    INSERT INTO attendance (
      id, staff_id, staff_uid, staff_name, designation, department, passport,
      date, check_in_time, check_out_time, duration_minutes, status, notes, workstation,
      created_at, updated_at
    ) VALUES (
      ${id},
      ${staff_id || ""},
      ${params.staff_uid.trim().toUpperCase()},
      ${staff_name || "Staff Member"},
      ${designation || "Staff"},
      ${department || "General"},
      ${passport || ""},
      ${todayStr},
      ${now},
      NULL,
      0,
      'checked_in',
      ${params.notes || ""},
      ${workstation || ""},
      ${now},
      ${now}
    )
    RETURNING *
  `
  return { attendance: fromAttendance(rows[0]), alreadyCheckedIn: false }
}

export async function checkOutStaff(attendanceId: string, notes?: string): Promise<AttendanceRecord | null> {
  await ready()
  const rows = await sql`SELECT * FROM attendance WHERE id = ${attendanceId} LIMIT 1`
  if (rows.length === 0) return null

  const record = rows[0]
  if (!record) return null
  const checkIn = new Date(record.check_in_time)
  const now = new Date()
  const durationMinutes = Math.max(0, Math.round((now.getTime() - checkIn.getTime()) / 60000))

  const updatedRows = await sql`
    UPDATE attendance
    SET check_out_time = ${now},
        duration_minutes = ${durationMinutes},
        status = 'completed',
        notes = CASE WHEN ${notes || ""} != '' THEN ${notes || ""} ELSE notes END,
        updated_at = ${now}
    WHERE id = ${attendanceId}
    RETURNING *
  `
  if (updatedRows.length === 0) return null
  return fromAttendance(updatedRows[0])
}

export async function getAttendanceLogs(filters?: {
  date?: string
  staff_uid?: string
  department?: string
  status?: string
  limit?: number
}): Promise<AttendanceRecord[]> {
  await ready()
  const limit = filters?.limit || 200

  let rows
  if (filters?.date && filters?.date !== "all") {
    rows = await sql`
      SELECT * FROM attendance
      WHERE date = ${filters.date}
      ORDER BY check_in_time DESC
      LIMIT ${limit}
    `
  } else {
    rows = await sql`
      SELECT * FROM attendance
      ORDER BY check_in_time DESC
      LIMIT ${limit}
    `
  }

  let list = rows.map(fromAttendance)
  if (filters?.staff_uid) {
    const q = filters.staff_uid.trim().toLowerCase()
    list = list.filter((r) =>
      r.staff_uid.toLowerCase().includes(q) ||
      r.staff_name.toLowerCase().includes(q)
    )
  }
  if (filters?.department && filters.department !== "all") {
    list = list.filter((r) => r.department === filters.department)
  }
  if (filters?.status && filters.status !== "all") {
    list = list.filter((r) => r.status === filters.status)
  }

  return list
}

export async function getAttendanceStats(dateStr?: string) {
  await ready()
  const targetDate = dateStr || getTodayDateString()
  const rows = await sql`
    SELECT
      COUNT(*)::int as total,
      COUNT(CASE WHEN check_out_time IS NULL THEN 1 END)::int as currently_checked_in,
      COUNT(CASE WHEN check_out_time IS NOT NULL THEN 1 END)::int as checked_out
    FROM attendance
    WHERE date = ${targetDate}
  `
  return {
    date: targetDate,
    totalToday: rows[0]?.total || 0,
    currentlyCheckedIn: rows[0]?.currently_checked_in || 0,
    checkedOut: rows[0]?.checked_out || 0,
  }
}

export async function deleteAttendance(id: string): Promise<boolean> {
  await ready()
  return (await sql`DELETE FROM attendance WHERE id = ${id} RETURNING id`).length > 0
}

function fromReport(row: any): StaffReport {
  return {
    id: row.id,
    _id: row.id,
    staff_uid: row.staff_uid || "",
    staff_name: row.staff_name || "",
    workstation: row.workstation || "",
    email: row.email || "",
    title: row.title || "",
    body: row.body || "",
    file_url: row.file_url || "",
    file_name: row.file_name || "",
    file_type: row.file_type || "",
    status: row.status || "pending",
    approved_by: row.approved_by || "",
    approved_by_id: row.approved_by_id || "",
    approved_at: row.approved_at ? new Date(row.approved_at).toISOString() : null,
    admin_notes: row.admin_notes || "",
    created_at: iso(row.created_at),
    updated_at: iso(row.updated_at),
  }
}

export async function createReport(data: {
  staff_uid: string
  staff_name?: string
  workstation: string
  email: string
  title: string
  body: string
  file_url?: string
  file_name?: string
  file_type?: string
}): Promise<StaffReport> {
  await ready()
  const id = crypto.randomUUID()
  const now = new Date()

  let staffName = data.staff_name || ""
  if (!staffName) {
    const bio = await lookupStaffForAttendance(data.staff_uid)
    if (bio) {
      staffName = `${bio.first_name} ${bio.last_name} ${bio.other_name || ""}`.trim()
    }
  }

  const rows = await sql`
    INSERT INTO reports (
      id, staff_uid, staff_name, workstation, email, title, body,
      file_url, file_name, file_type, status,
      approved_by, approved_by_id, approved_at, admin_notes,
      created_at, updated_at
    ) VALUES (
      ${id},
      ${data.staff_uid.trim().toUpperCase()},
      ${staffName || "Staff Member"},
      ${data.workstation.trim()},
      ${data.email.trim().toLowerCase()},
      ${data.title.trim()},
      ${data.body.trim()},
      ${data.file_url || ""},
      ${data.file_name || ""},
      ${data.file_type || ""},
      'pending',
      '',
      '',
      NULL,
      '',
      ${now},
      ${now}
    )
    RETURNING *
  `
  return fromReport(rows[0])
}

export async function getReportsList(filters?: {
  status?: string
  staff_uid?: string
  search?: string
  limit?: number
}): Promise<StaffReport[]> {
  await ready()
  const limit = filters?.limit || 200

  let rows
  if (filters?.status && filters.status !== "all") {
    rows = await sql`
      SELECT * FROM reports
      WHERE status = ${filters.status}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `
  } else {
    rows = await sql`
      SELECT * FROM reports
      ORDER BY created_at DESC
      LIMIT ${limit}
    `
  }

  let list = rows.map(fromReport)
  if (filters?.staff_uid) {
    const q = filters.staff_uid.trim().toLowerCase()
    list = list.filter((r) => r.staff_uid.toLowerCase().includes(q))
  }
  if (filters?.search) {
    const q = filters.search.trim().toLowerCase()
    list = list.filter((r) =>
      r.title.toLowerCase().includes(q) ||
      r.staff_name.toLowerCase().includes(q) ||
      r.staff_uid.toLowerCase().includes(q) ||
      r.workstation.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q)
    )
  }

  return list
}

export async function getReportById(id: string): Promise<StaffReport | null> {
  await ready()
  const rows = await sql`SELECT * FROM reports WHERE id = ${id} LIMIT 1`
  if (rows.length === 0) return null
  return fromReport(rows[0])
}

export async function approveReport(
  id: string,
  adminName: string,
  adminId?: string,
  notes?: string
): Promise<StaffReport | null> {
  await ready()
  const now = new Date()
  const rows = await sql`
    UPDATE reports
    SET status = 'approved',
        approved_by = ${adminName.trim()},
        approved_by_id = ${adminId || ""},
        approved_at = ${now},
        admin_notes = CASE WHEN ${notes || ""} != '' THEN ${notes || ""} ELSE admin_notes END,
        updated_at = ${now}
    WHERE id = ${id}
    RETURNING *
  `
  if (rows.length === 0) return null
  return fromReport(rows[0])
}

export async function updateReportStatus(
  id: string,
  status: string,
  notes?: string
): Promise<StaffReport | null> {
  await ready()
  const now = new Date()
  const rows = await sql`
    UPDATE reports
    SET status = ${status},
        admin_notes = CASE WHEN ${notes || ""} != '' THEN ${notes || ""} ELSE admin_notes END,
        updated_at = ${now}
    WHERE id = ${id}
    RETURNING *
  `
  if (rows.length === 0) return null
  return fromReport(rows[0])
}

export async function deleteReport(id: string): Promise<boolean> {
  await ready()
  return (await sql`DELETE FROM reports WHERE id = ${id} RETURNING id`).length > 0
}

function fromAuditLog(row: any): AuditLogEntry {
  return {
    id: row.id,
    _id: row.id,
    actor_id: row.actor_id || "",
    actor_name: row.actor_name || "",
    actor_role: row.actor_role || "admin",
    action: row.action || "UPDATE",
    resource: row.resource || "system",
    resource_id: row.resource_id || "",
    details: row.details || "",
    ip_address: row.ip_address || "",
    user_agent: row.user_agent || "",
    status: row.status || "success",
    created_at: iso(row.created_at),
  }
}

export async function logAudit(entry: {
  actor_id?: string
  actor_name?: string
  actor_role?: string
  action: string
  resource: string
  resource_id?: string
  details: string
  ip_address?: string
  user_agent?: string
  status?: string
}): Promise<AuditLogEntry> {
  await ready()
  const id = crypto.randomUUID()
  const now = new Date()

  const rows = await sql`
    INSERT INTO audit_logs (
      id, actor_id, actor_name, actor_role, action, resource,
      resource_id, details, ip_address, user_agent, status, created_at
    ) VALUES (
      ${id},
      ${entry.actor_id || ""},
      ${entry.actor_name || "System"},
      ${entry.actor_role || "admin"},
      ${entry.action.toUpperCase()},
      ${entry.resource.toLowerCase()},
      ${entry.resource_id || ""},
      ${entry.details},
      ${entry.ip_address || ""},
      ${entry.user_agent || ""},
      ${entry.status || "success"},
      ${now}
    )
    RETURNING *
  `
  return fromAuditLog(rows[0])
}

export async function getAuditLogs(filters?: {
  action?: string
  resource?: string
  actor?: string
  status?: string
  search?: string
  limit?: number
}): Promise<AuditLogEntry[]> {
  await ready()
  const limit = filters?.limit || 250

  let rows
  if (filters?.action && filters.action !== "all") {
    rows = await sql`
      SELECT * FROM audit_logs
      WHERE action = ${filters.action.toUpperCase()}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `
  } else if (filters?.resource && filters.resource !== "all") {
    rows = await sql`
      SELECT * FROM audit_logs
      WHERE resource = ${filters.resource.toLowerCase()}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `
  } else {
    rows = await sql`
      SELECT * FROM audit_logs
      ORDER BY created_at DESC
      LIMIT ${limit}
    `
  }

  let list = rows.map(fromAuditLog)
  if (filters?.actor) {
    const q = filters.actor.trim().toLowerCase()
    list = list.filter((r) => r.actor_name.toLowerCase().includes(q))
  }
  if (filters?.status && filters.status !== "all") {
    list = list.filter((r) => r.status.toLowerCase() === filters.status?.toLowerCase())
  }
  if (filters?.search) {
    const q = filters.search.trim().toLowerCase()
    list = list.filter((r) =>
      r.details.toLowerCase().includes(q) ||
      r.actor_name.toLowerCase().includes(q) ||
      r.action.toLowerCase().includes(q) ||
      r.resource.toLowerCase().includes(q) ||
      (r.resource_id || "").toLowerCase().includes(q)
    )
  }

  return list
}

export async function getAuditStats() {
  await ready()
  const rows = await sql`
    SELECT
      COUNT(*)::int as total,
      COUNT(CASE WHEN action = 'LOGIN' THEN 1 END)::int as logins,
      COUNT(CASE WHEN action = 'APPROVE' THEN 1 END)::int as approvals,
      COUNT(CASE WHEN action = 'DELETE' THEN 1 END)::int as deletions,
      COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END)::int as today_count
    FROM audit_logs
  `
  return {
    total: rows[0]?.total || 0,
    logins: rows[0]?.logins || 0,
    approvals: rows[0]?.approvals || 0,
    deletions: rows[0]?.deletions || 0,
    todayCount: rows[0]?.today_count || 0,
  }
}

export async function clearAuditLogs(): Promise<boolean> {
  await ready()
  await sql`DELETE FROM audit_logs`
  return true
}

export default { ready }
