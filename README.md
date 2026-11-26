# TR3-G Innovations Limited

> **Enterprise Software, Built Secure.**  
> High-performance custom digital ecosystems, revenue administration, and public infrastructure engineering.

---

## 🏛️ About TR3-G

**TR3-G Innovations Limited** designs, engineers, and operates mission-critical digital systems for public institutions, state revenue agencies, and private enterprises. Built on the principle that institutional software should be treated with the rigor of a public trust, TR3-G replaces fragile manual paperwork and generic off-the-shelf templates with secure, resilient, full-stack digital architectures engineered from the database layer up.

* **Headquarters & Operations Hub**: AA2 Behind Arena Off Dunamis Church, Kuje, Abuja, Nigeria.
* **Core Philosophy**: Innovation, Integrity, Excellence, Client-Centricity, and Collaboration.

---

## ⚡ Platform Architecture & Features

This repository contains the official TR3-G enterprise web platform and administrative operating system built as a scalable Next.js monorepo:

### 1. 🌐 Public Digital Presence
* **Landing & Identity Story**: Interactive showcase of engineering values, milestones, and architectural philosophy.
* **Solutions Catalog**: Bespoke enterprise software, state revenue automation, document indexing, and infrastructure management.
* **Team & Partners Directory**: Highlights executive leadership, technical experts, and strategic partners.
* **Careers & Application Flow**: Public recruitment portal with automated applicant receipt confirmation via Brevo.
* **Media & Project Gallery**: Public and verified project showcases, video tours, and system demonstrations.
* **Consultation & Contact Channels**: Direct messaging channels connected to the Abuja operations center.

### 2. 🛡️ Staff & Operations Portals (Public-Facing Entrypoints)
* **Staff BioData Onboarding** (`/public/bio-data/create-new`): Comprehensive profile submission with auto-generated Staff UID, dual-guarantor verification, and NIN document uploads.
* **Staff Daily / Incident Reporting** (`/reports/submit`): Standardized operational report submission with automatic confirmation emails and admin notification.

### 3. 🔐 Enterprise Admin Suite (`/admin`)
* **Role-Based Access Control (RBAC)**: Superadmin, Admin, and Staff tiers secured by Argon2 password hashing and signed HTTP cookies.
* **Attendance Terminal & Logs**: Interactive terminal for Staff ID lookup, biometric-ready identification modal, 1-click check-in/check-out, and searchable logs.
* **BioData Management**: Admin review, filtering, and detail verification of internal personnel.
* **Report Review & Approval Workflow**: Automated email notifications sent to staff upon admin review and approval.
* **Broadcast & Targeted Mailer**: Integrated Brevo dispatch console for sending announcements to Applicants, Staff, Contact leads, or custom recipient lists.
* **Solutions & Content CMS**: Real-time management of solutions, external links, status toggles, team members, and partners with Cloudinary asset uploads.
* **Interactive Media Gallery**: Manage video and photo assets with public/private visibility controls.
* **Security & Audit Logs**: Immutable system-wide logging capturing timestamps, user roles, IP addresses, and operational actions.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React 19) |
| **Monorepo Engine** | [Turborepo](https://turbo.build/repo) |
| **Styling & Components** | [Tailwind CSS v4](https://tailwindcss.com/), Radix UI / Base UI, Lucide Icons |
| **Database** | [Neon PostgreSQL](https://neon.tech/) via [postgres.js](https://github.com/porsager/postgres) |
| **Media Storage** | [Cloudinary](https://cloudinary.com/) (Secure document & image asset management) |
| **Transactional Email** | [Brevo (Sendinblue)](https://www.brevo.com/) REST API |
| **Security & Auth** | Argon2 password hashing, JSON Web Tokens (JWT) |

---

## 📂 Repository Structure

```
tr3-g/
├── apps/
│   └── web/                     # Primary Next.js application & API routes
│       ├── app/                 # Next.js App Router (Public, Admin, API endpoints)
│       ├── components/          # Application-level UI components
│       ├── lib/                 # Database queries, auth helpers, and email utilities
│       ├── scripts/             # Database migration and seed automation
│       └── public/              # Brand assets, logos, and static icons
├── packages/
│   ├── ui/                      # Shared Shadcn / Tailwind component library
│   ├── eslint-config/           # Monorepo linting configurations
│   └── typescript-config/       # Base tsconfig presets
├── package.json                 # Workspace dependencies & root scripts
└── turbo.json                   # Turborepo task pipeline configuration
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: `>= 20.9.0`
* **Package Manager**: `npm` (v10+ or v12+)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Tr3-G/tr3-g.git
   cd tr3-g
   ```

2. Install dependencies across the monorepo:
   ```bash
   npm install
   ```

### Database Migration
To set up all tables (`users`, `solutions`, `partners`, `team`, `applications`, `gallery`, `biodata`, `guarantors`, `attendance`, `reports`, `audit_logs`) and indexes:

```bash
npm run db:migrate
```

### Development
Start all workspace apps in development mode:

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### Production Build & Verification
```bash
# Typecheck
npm --workspace web run typecheck

# Build for production
npm --workspace web run build

# Start production server
npm --workspace web run start
```

---

## 🔒 Security & Compliance

* All administrative endpoints verify signed JWT sessions and active user status.
* Audit logging automatically records critical administrative activities (logins, submissions, approvals, updates).
* Document uploads and public bio-data endpoints are sanitized and isolated.

---

## 📄 License & Proprietary Notice

Copyright © 2026 **TR3-G Innovations Limited**. All rights reserved.  
Unauthorized distribution, modification, or commercial reproduction of this software and its proprietary architecture is strictly prohibited.
