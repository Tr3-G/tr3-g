import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import postgres from "postgres"
import argon2 from "argon2"
import crypto from "node:crypto"

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const envFile = path.join(scriptDir, "..", ".env")

let databaseUrl = process.env.DATABASE_URL
if (!databaseUrl && fs.existsSync(envFile)) {
  const content = fs.readFileSync(envFile, "utf8")
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (trimmed.startsWith("DATABASE_URL=")) {
      databaseUrl = trimmed.slice("DATABASE_URL=".length).trim()
      // Remove any surrounding quotes
      if (databaseUrl.startsWith('"') && databaseUrl.endsWith('"')) {
        databaseUrl = databaseUrl.slice(1, -1)
      } else if (databaseUrl.startsWith("'") && databaseUrl.endsWith("'")) {
        databaseUrl = databaseUrl.slice(1, -1)
      }
      break
    }
  }
}

if (!databaseUrl) {
  console.error("❌ ERROR: DATABASE_URL not found in environment or apps/web/.env")
  process.exit(1)
}

console.log("🔗 Connecting to PostgreSQL database...")
const sql = postgres(databaseUrl, { max: 5, prepare: false })

async function runMigration() {
  console.log("🚀 Executing database migration schema...\n")

  // 1. Create Core Tables
  await sql.unsafe(`
    -- 1. Images & File Assets
    CREATE TABLE IF NOT EXISTS images (
      id text PRIMARY KEY,
      filename text NOT NULL,
      mime text NOT NULL,
      size integer NOT NULL,
      bytes bytea NOT NULL,
      created_at timestamptz NOT NULL
    );

    -- 2. CMS Content (Services, Solutions, Team, Partners, Careers, Stack)
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

    -- 3. Career Applications
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
      status text NOT NULL DEFAULT 'new',
      created_at timestamptz NOT NULL
    );

    -- 4. Contact Inquiries
    CREATE TABLE IF NOT EXISTS contacts (
      id text PRIMARY KEY,
      name text NOT NULL,
      organization text NOT NULL DEFAULT '',
      email text NOT NULL,
      phone text NOT NULL DEFAULT '',
      topic text NOT NULL DEFAULT '',
      message text NOT NULL,
      status text NOT NULL DEFAULT 'new',
      created_at timestamptz NOT NULL
    );

    -- 5. Administrative Staff Users
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

    -- 6. Recruitment Forms Builder
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

    -- 7. Media Gallery (with public boolean)
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

    -- 8. Personnel BioData & Central Registry
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

    -- 9. Daily Workforce Attendance
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

    -- 10. Operational Reports & Shift Handovers
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

    -- 11. Enterprise Compliance & Security Audit Logs
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

    -- Schema Indexes
    CREATE INDEX IF NOT EXISTS content_type_active_sort_idx ON content(type, active, sort_order);
    CREATE INDEX IF NOT EXISTS applications_created_idx ON applications(created_at DESC);
    CREATE INDEX IF NOT EXISTS contacts_created_idx ON contacts(created_at DESC);
    CREATE INDEX IF NOT EXISTS forms_created_idx ON recruitment_forms(created_at DESC);
    CREATE INDEX IF NOT EXISTS gallery_created_idx ON gallery(created_at DESC);
    CREATE INDEX IF NOT EXISTS biodata_created_idx ON biodata(created_at DESC);
    CREATE INDEX IF NOT EXISTS biodata_staff_uid_idx ON biodata(staff_uid);
    CREATE INDEX IF NOT EXISTS attendance_date_idx ON attendance(date DESC);
    CREATE INDEX IF NOT EXISTS attendance_staff_uid_idx ON attendance(staff_uid);
    CREATE INDEX IF NOT EXISTS attendance_created_idx ON attendance(created_at DESC);
    CREATE INDEX IF NOT EXISTS reports_created_idx ON reports(created_at DESC);
    CREATE INDEX IF NOT EXISTS reports_staff_uid_idx ON reports(staff_uid);
    CREATE INDEX IF NOT EXISTS reports_status_idx ON reports(status);
    CREATE INDEX IF NOT EXISTS audit_logs_created_idx ON audit_logs(created_at DESC);
    CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON audit_logs(action);
    CREATE INDEX IF NOT EXISTS audit_logs_resource_idx ON audit_logs(resource);
    CREATE INDEX IF NOT EXISTS audit_logs_actor_idx ON audit_logs(actor_name);

    -- Column Alterations for Backward Compatibility
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

  console.log("✅ DDL schema execution finished successfully.\n")

  // Ensure default administrator account exists
  const existingStaff = await sql`SELECT count(*)::int as count FROM staff`
  if (existingStaff[0].count === 0) {
    console.log("👤 Creating default admin staff account...")
    const passwordHash = await argon2.hash("admin123")
    const now = new Date()
    await sql`
      INSERT INTO staff (
        id, username, email, full_name, password_hash, role, permissions, active, created_at, updated_at
      ) VALUES (
        ${crypto.randomUUID()},
        'admin',
        'admin@tr3-g.com.ng',
        'System Administrator',
        ${passwordHash},
        'superadmin',
        ${sql.json({
          manage_content: true,
          manage_staff: true,
          manage_applications: true,
          manage_recruitment: true,
          manage_contacts: true,
          manage_biodata: true,
          manage_attendance: true,
          manage_reports: true,
          manage_gallery: true,
          view_audit_logs: true,
        })},
        true,
        ${now},
        ${now}
      )
    `
    console.log("✅ Default superadmin account provisioned (admin / admin123).")
  }

  // Record audit log entry for migration
  await sql`
    INSERT INTO audit_logs (
      id, actor_id, actor_name, actor_role, action, resource, resource_id, details, status, created_at
    ) VALUES (
      ${crypto.randomUUID()},
      'system',
      'Database Migration Engine',
      'system',
      'MIGRATE',
      'system',
      'all_tables',
      'Full database schema migration executed successfully.',
      'success',
      ${new Date()}
    )
  `

  // 2. Fetch and Print Table Status
  const tables = await sql`
    SELECT 
      table_name,
      (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
    FROM information_schema.tables t
    WHERE table_schema = 'public'
    ORDER BY table_name ASC
  `

  console.log("📊 Active Database Tables in Public Schema:")
  console.log("---------------------------------------------------------")
  for (const t of tables) {
    const countRow = await sql.unsafe(`SELECT count(*)::int as count FROM "${t.table_name}"`)
    const rowCount = countRow[0]?.count ?? 0
    console.log(
      `  • ${t.table_name.padEnd(20)} | Columns: ${String(t.column_count).padEnd(4)} | Rows: ${rowCount}`
    )
  }
  console.log("---------------------------------------------------------")
  console.log("\n🎉 Database migration completed with zero errors!")

  await sql.end()
}

runMigration().catch((err) => {
  console.error("❌ Migration failed with error:", err)
  process.exit(1)
})
