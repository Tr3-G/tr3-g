import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import Datastore from "@seald-io/nedb"
import postgres from "postgres"

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(scriptDir, "..", "data")
const envFile = path.join(scriptDir, "..", ".env")

if (!process.env.DATABASE_URL && fs.existsSync(envFile)) {
  const line = fs.readFileSync(envFile, "utf8").split(/\r?\n/).find((value) => value.startsWith("DATABASE_URL="))
  if (line) process.env.DATABASE_URL = line.slice("DATABASE_URL=".length).trim()
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not configured")
}

const sql = postgres(process.env.DATABASE_URL, { max: 5, prepare: false })
const now = () => new Date().toISOString()
const date = (value) => {
  const parsed = value ? new Date(String(value).replace(" ", "T").replace(/\+00$/, "Z")) : new Date()
  return Number.isNaN(parsed.getTime()) ? now() : parsed.toISOString()
}

async function load(name) {
  const datastore = new Datastore({ filename: path.join(dataDir, name), autoload: false })
  await datastore.loadDatabaseAsync()
  return datastore.findAsync({})
}

await sql.unsafe(`
  CREATE TABLE IF NOT EXISTS images (
    id text PRIMARY KEY, filename text NOT NULL, mime text NOT NULL, size integer NOT NULL,
    bytes bytea NOT NULL, created_at timestamptz NOT NULL
  );
  CREATE TABLE IF NOT EXISTS content (
    id text PRIMARY KEY, numeric_id text, type text NOT NULL, title text NOT NULL, slug text NOT NULL,
    description text NOT NULL DEFAULT '', body text NOT NULL DEFAULT '', icon text NOT NULL DEFAULT 'briefcase',
    image_id text REFERENCES images(id) ON DELETE SET NULL, image_mime text,
    document_id text REFERENCES images(id) ON DELETE SET NULL, document_name text, document_mime text,
    meta jsonb NOT NULL DEFAULT '{}'::jsonb, sort_order integer NOT NULL DEFAULT 0, active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL
  );
  CREATE TABLE IF NOT EXISTS applications (
    id text PRIMARY KEY, career_id text, career_title text, form_id text, form_title text,
    custom_answers jsonb NOT NULL DEFAULT '{}'::jsonb, full_name text NOT NULL, email text NOT NULL,
    phone text NOT NULL DEFAULT '', link text NOT NULL DEFAULT '', cover_note text NOT NULL,
    resume_id text, resume_name text, resume_mime text, status text NOT NULL, created_at timestamptz NOT NULL
  );
  CREATE TABLE IF NOT EXISTS contacts (
    id text PRIMARY KEY, name text NOT NULL, organization text NOT NULL DEFAULT '', email text NOT NULL,
    phone text NOT NULL DEFAULT '', topic text NOT NULL DEFAULT '', message text NOT NULL,
    status text NOT NULL, created_at timestamptz NOT NULL
  );
  CREATE TABLE IF NOT EXISTS staff (
    id text PRIMARY KEY, username text NOT NULL UNIQUE, email text NOT NULL, full_name text NOT NULL,
    password_hash text NOT NULL, role text NOT NULL, permissions jsonb NOT NULL,
    active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL
  );
  CREATE TABLE IF NOT EXISTS recruitment_forms (
    id text PRIMARY KEY, title text NOT NULL, code text NOT NULL, description text NOT NULL DEFAULT '',
    category text NOT NULL DEFAULT 'General', career_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
    fields jsonb NOT NULL DEFAULT '[]'::jsonb, active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL
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
`)

const [images, content, applications, contacts, staff, forms] = await Promise.all([
  load("images.db"),
  load("content.db"),
  load("applications.db"),
  load("contacts.db"),
  load("staff.db"),
  load("forms.db"),
])

await sql.begin(async (tx) => {
  for (const item of images) {
    const bytes = Buffer.from(item.bytes_base64 || "", "base64")
    await tx`
      INSERT INTO images (id, filename, mime, size, bytes, created_at)
      VALUES (${String(item._id)}, ${item.filename || "file"}, ${item.mime || "application/octet-stream"}, ${item.size || bytes.length}, ${bytes}, ${date(item.created_at)})
      ON CONFLICT (id) DO UPDATE SET filename = EXCLUDED.filename, mime = EXCLUDED.mime, size = EXCLUDED.size, bytes = EXCLUDED.bytes, created_at = EXCLUDED.created_at
    `
  }

  for (const item of content) {
    await tx`
      INSERT INTO content (id, numeric_id, type, title, slug, description, body, icon, image_id, image_mime, document_id, document_name, document_mime, meta, sort_order, active, created_at, updated_at)
      VALUES (${String(item._id)}, ${item.id == null ? null : String(item.id)}, ${item.type}, ${item.title}, ${item.slug}, ${item.description || ""}, ${item.body || ""}, ${item.icon || "briefcase"}, ${item.image_id || null}, ${item.image_mime || null}, ${item.document_id || null}, ${item.document_name || null}, ${item.document_mime || null}, ${sql.json(item.meta || {})}, ${Number(item.sort_order || 0)}, ${item.active !== false}, ${date(item.created_at)}, ${date(item.updated_at)})
      ON CONFLICT (id) DO UPDATE SET numeric_id = EXCLUDED.numeric_id, type = EXCLUDED.type, title = EXCLUDED.title, slug = EXCLUDED.slug, description = EXCLUDED.description, body = EXCLUDED.body, icon = EXCLUDED.icon, image_id = EXCLUDED.image_id, image_mime = EXCLUDED.image_mime, document_id = EXCLUDED.document_id, document_name = EXCLUDED.document_name, document_mime = EXCLUDED.document_mime, meta = EXCLUDED.meta, sort_order = EXCLUDED.sort_order, active = EXCLUDED.active, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at
    `
  }

  for (const item of applications) {
    await tx`
      INSERT INTO applications (id, career_id, career_title, form_id, form_title, custom_answers, full_name, email, phone, link, cover_note, resume_id, resume_name, resume_mime, status, created_at)
      VALUES (${String(item._id)}, ${item.career_id == null ? null : String(item.career_id)}, ${item.career_title || null}, ${item.form_id || null}, ${item.form_title || null}, ${sql.json(item.custom_answers || {})}, ${item.full_name}, ${item.email}, ${item.phone || ""}, ${item.link || ""}, ${item.cover_note || ""}, ${item.resume_id || null}, ${item.resume_name || null}, ${item.resume_mime || null}, ${item.status || "new"}, ${date(item.created_at)})
      ON CONFLICT (id) DO UPDATE SET career_id = EXCLUDED.career_id, career_title = EXCLUDED.career_title, form_id = EXCLUDED.form_id, form_title = EXCLUDED.form_title, custom_answers = EXCLUDED.custom_answers, full_name = EXCLUDED.full_name, email = EXCLUDED.email, phone = EXCLUDED.phone, link = EXCLUDED.link, cover_note = EXCLUDED.cover_note, resume_id = EXCLUDED.resume_id, resume_name = EXCLUDED.resume_name, resume_mime = EXCLUDED.resume_mime, status = EXCLUDED.status, created_at = EXCLUDED.created_at
    `
  }

  for (const item of contacts) {
    await tx`
      INSERT INTO contacts (id, name, organization, email, phone, topic, message, status, created_at)
      VALUES (${String(item._id)}, ${item.name}, ${item.organization || ""}, ${item.email}, ${item.phone || ""}, ${item.topic || ""}, ${item.message || ""}, ${item.status || "new"}, ${date(item.created_at)})
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, organization = EXCLUDED.organization, email = EXCLUDED.email, phone = EXCLUDED.phone, topic = EXCLUDED.topic, message = EXCLUDED.message, status = EXCLUDED.status, created_at = EXCLUDED.created_at
    `
  }

  for (const item of staff) {
    await tx`
      INSERT INTO staff (id, username, email, full_name, password_hash, role, permissions, active, created_at, updated_at)
      VALUES (${String(item._id)}, ${item.username}, ${item.email}, ${item.full_name}, ${item.password_hash}, ${item.role || "staff"}, ${sql.json(item.permissions || {})}, ${item.active !== false}, ${date(item.created_at)}, ${date(item.updated_at || item.created_at)})
      ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username, email = EXCLUDED.email, full_name = EXCLUDED.full_name, password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, permissions = EXCLUDED.permissions, active = EXCLUDED.active, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at
    `
  }

  for (const item of forms) {
    await tx`
      INSERT INTO recruitment_forms (id, title, code, description, category, career_ids, fields, active, created_at, updated_at)
      VALUES (${String(item._id)}, ${item.title}, ${item.code}, ${item.description || ""}, ${item.category || "General"}, ${sql.json(item.career_ids || [])}, ${sql.json(item.fields || [])}, ${item.active !== false}, ${date(item.created_at)}, ${date(item.updated_at || item.created_at)})
      ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, code = EXCLUDED.code, description = EXCLUDED.description, category = EXCLUDED.category, career_ids = EXCLUDED.career_ids, fields = EXCLUDED.fields, active = EXCLUDED.active, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at
    `
  }
})

console.log(`Migrated NeDB data to PostgreSQL: ${content.length} content, ${applications.length} applications, ${contacts.length} contacts, ${staff.length} staff, ${forms.length} forms, ${images.length} files.`)
await sql.end()
