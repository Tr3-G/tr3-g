"use client"

import * as React from "react"
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Key,
  ShieldAlert,
} from "lucide-react"
import { useAdminAuth } from "@/hooks/use-admin-auth"

interface StaffItem {
  _id: string
  username: string
  email: string
  full_name: string
  role: "admin" | "staff"
  permissions: {
    create: boolean
    read: boolean
    update: boolean
    delete: boolean
  }
  active: boolean
  created_at: string
}

export default function AdminStaffPage() {
  const { user, canCreate, canUpdate, canDelete, isAdmin } = useAdminAuth()
  const [staffList, setStaffList] = React.useState<StaffItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [success, setSuccess] = React.useState("")

  // Modal states
  const [showAddModal, setShowAddModal] = React.useState(false)
  const [editingStaff, setEditingStaff] = React.useState<StaffItem | null>(null)

  // Form states for new staff
  const [formData, setFormData] = React.useState({
    username: "",
    email: "",
    full_name: "",
    password: "",
    role: "staff" as "admin" | "staff",
    permissions: {
      create: false,
      read: true,
      update: false,
      delete: false,
    },
  })

  // Edit form states
  const [editData, setEditData] = React.useState({
    email: "",
    full_name: "",
    password: "",
    role: "staff" as "admin" | "staff",
    active: true,
    permissions: {
      create: false,
      read: true,
      update: false,
      delete: false,
    },
  })

  const loadStaff = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/staff")
      if (res.ok) {
        const data = await res.json()
        setStaffList(data)
      } else {
        const err = await res.json()
        setError(err.error || "Failed to load staff")
      }
    } catch (err: any) {
      setError(err.message || "Failed to load staff")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadStaff()
  }, [])

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to create staff member")
      }

      setSuccess(`Staff account "${formData.username}" created successfully with Argon2 encryption.`)
      setShowAddModal(false)
      setFormData({
        username: "",
        email: "",
        full_name: "",
        password: "",
        role: "staff",
        permissions: {
          create: false,
          read: true,
          update: false,
          delete: false,
        },
      })
      await loadStaff()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingStaff) return
    setError("")
    setSuccess("")

    try {
      const res = await fetch(`/api/admin/staff/${editingStaff._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to update staff member")
      }

      setSuccess(`Staff account "${editingStaff.username}" updated successfully.`)
      setEditingStaff(null)
      await loadStaff()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDeleteStaff = async (id: string, username: string) => {
    if (!confirm(`Are you sure you want to delete staff account "${username}"?`)) return
    setError("")
    setSuccess("")

    try {
      const res = await fetch(`/api/admin/staff/${id}`, {
        method: "DELETE",
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete staff member")
      }

      setSuccess(`Staff member "${username}" deleted.`)
      await loadStaff()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const startEdit = (s: StaffItem) => {
    setEditingStaff(s)
    setEditData({
      email: s.email,
      full_name: s.full_name,
      password: "",
      role: s.role,
      active: s.active,
      permissions: {
        create: Boolean(s.permissions?.create),
        read: s.permissions?.read !== false,
        update: Boolean(s.permissions?.update),
        delete: Boolean(s.permissions?.delete),
      },
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b rule pb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide teal-text">
            ACCESS & IDENTITY CONTROL
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">
            Staff Management
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-custom)]">
            Create staff accounts, configure logins, and assign granular permissions (Create, Read, Update, Delete) protected by Argon2.
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-brass inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Staff Member</span>
          </button>
        )}
      </div>

      {/* Notifications */}
      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400">
          {success}
        </div>
      )}

      {/* Staff Table */}
      <div className="rounded-lg border rule bg-[var(--surface)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b rule bg-[var(--surface-2)] font-mono text-xs text-[var(--muted-custom)] uppercase">
              <tr>
                <th className="px-6 py-3.5">Staff User</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Permissions (CRUD)</th>
                <th className="px-6 py-3.5">Created</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y rule">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center font-mono text-xs text-[var(--muted-custom)]">
                    Loading staff accounts...
                  </td>
                </tr>
              ) : staffList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center font-mono text-xs text-[var(--muted-custom)]">
                    No staff members found.
                  </td>
                </tr>
              ) : (
                staffList.map((s) => (
                  <tr key={s._id} className="hover:bg-[var(--surface-2)]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[var(--ink)]">{s.full_name}</div>
                      <div className="font-mono text-xs text-[var(--muted-custom)]">
                        @{s.username} · {s.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[11px] uppercase ${
                          s.role === "admin"
                            ? "bg-[var(--brass)]/20 text-[var(--brass)] border border-[var(--brass)]/30"
                            : "bg-[var(--surface-2)] text-[var(--muted-custom)] border rule"
                        }`}
                      >
                        {s.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 font-mono text-xs ${
                          s.active ? "text-emerald-400" : "text-zinc-500"
                        }`}
                      >
                        {s.active ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-zinc-500" />
                        )}
                        <span>{s.active ? "Active" : "Disabled"}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 font-mono text-xs">
                        <span
                          className={`px-2 py-0.5 rounded border ${
                            s.role === "admin" || s.permissions?.create
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : "bg-zinc-800/40 text-zinc-600 border-zinc-800"
                          }`}
                        >
                          Create
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded border ${
                            s.role === "admin" || s.permissions?.read
                              ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                              : "bg-zinc-800/40 text-zinc-600 border-zinc-800"
                          }`}
                        >
                          Read
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded border ${
                            s.role === "admin" || s.permissions?.update
                              ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                              : "bg-zinc-800/40 text-zinc-600 border-zinc-800"
                          }`}
                        >
                          Update
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded border ${
                            s.role === "admin" || s.permissions?.delete
                              ? "bg-red-500/15 text-red-400 border-red-500/30"
                              : "bg-zinc-800/40 text-zinc-600 border-zinc-800"
                          }`}
                        >
                          Delete
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-[var(--muted-custom)]">
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canUpdate && (
                          <button
                            onClick={() => startEdit(s)}
                            className="rounded border rule p-1.5 text-[var(--ink)] hover:border-[var(--brass)] hover:text-[var(--brass)]"
                            title="Edit Permissions"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {canDelete && user?.id !== s._id && (
                          <button
                            onClick={() => handleDeleteStaff(s._id, s.username)}
                            className="rounded border rule p-1.5 text-red-400 hover:border-red-500 hover:bg-red-500/10"
                            title="Delete Staff"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-lg border rule-strong bg-[var(--surface)] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b rule pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 brass-text" />
                <h2 className="font-display text-xl font-bold">New Staff Account</h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[var(--muted-custom)] hover:text-[var(--ink)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-[var(--muted-custom)]">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="e.g. jdoe"
                    className="mt-1.5 w-full rounded border rule bg-[var(--bg)] px-3 py-2 font-mono text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-[var(--muted-custom)]">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as "admin" | "staff",
                        permissions:
                          e.target.value === "admin"
                            ? { create: true, read: true, update: true, delete: true }
                            : formData.permissions,
                      })
                    }
                    className="mt-1.5 w-full rounded border rule bg-[var(--bg)] px-3 py-2 font-mono text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                  >
                    <option value="staff">Staff Member</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs text-[var(--muted-custom)]">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="mt-1.5 w-full rounded border rule bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-[var(--muted-custom)]">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="jdoe@tr3-g.com.ng"
                  className="mt-1.5 w-full rounded border rule bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-[var(--muted-custom)]">
                  Password (Argon2 Hashed) *
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="mt-1.5 w-full rounded border rule bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                />
              </div>

              {/* Permissions Checkboxes */}
              <div className="rounded border rule bg-[var(--surface-2)] p-4">
                <label className="block font-mono text-xs font-semibold text-[var(--ink)] uppercase">
                  Granular Access & Permissions
                </label>
                <p className="mt-1 font-mono text-[11px] text-[var(--muted-custom)]">
                  Check which CRUD actions this staff user is authorized to perform:
                </p>

                <div className="mt-3 grid grid-cols-2 gap-3 font-mono text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions.create}
                      disabled={formData.role === "admin"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          permissions: { ...formData.permissions, create: e.target.checked },
                        })
                      }
                      className="rounded accent-[var(--brass)]"
                    />
                    <span>Create (Add Items)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions.read}
                      disabled={formData.role === "admin"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          permissions: { ...formData.permissions, read: e.target.checked },
                        })
                      }
                      className="rounded accent-[var(--brass)]"
                    />
                    <span>Read (View Data)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions.update}
                      disabled={formData.role === "admin"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          permissions: { ...formData.permissions, update: e.target.checked },
                        })
                      }
                      className="rounded accent-[var(--brass)]"
                    />
                    <span>Update (Edit Items)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions.delete}
                      disabled={formData.role === "admin"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          permissions: { ...formData.permissions, delete: e.target.checked },
                        })
                      }
                      className="rounded accent-[var(--brass)]"
                    />
                    <span>Delete (Remove Items)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded border rule px-4 py-2 font-mono text-xs text-[var(--ink)] hover:bg-[var(--surface-2)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-brass rounded px-5 py-2 text-xs font-semibold"
                >
                  Create Staff Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-lg border rule-strong bg-[var(--surface)] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b rule pb-4">
              <div className="flex items-center gap-2">
                <Edit2 className="h-5 w-5 brass-text" />
                <h2 className="font-display text-xl font-bold">
                  Edit Staff: @{editingStaff.username}
                </h2>
              </div>
              <button
                onClick={() => setEditingStaff(null)}
                className="text-[var(--muted-custom)] hover:text-[var(--ink)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateStaff} className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-[var(--muted-custom)]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editData.full_name}
                    onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                    className="mt-1.5 w-full rounded border rule bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-[var(--muted-custom)]">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className="mt-1.5 w-full rounded border rule bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs text-[var(--muted-custom)]">
                  Change Password (Leave blank to keep current)
                </label>
                <input
                  type="password"
                  value={editData.password}
                  onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                  placeholder="New password (re-hashes with Argon2)"
                  className="mt-1.5 w-full rounded border rule bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                />
              </div>

              {isAdmin && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-xs text-[var(--muted-custom)]">
                      Role
                    </label>
                    <select
                      value={editData.role}
                      onChange={(e) => setEditData({ ...editData, role: e.target.value as any })}
                      className="mt-1.5 w-full rounded border rule bg-[var(--bg)] px-3 py-2 font-mono text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                    >
                      <option value="staff">Staff</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-[var(--muted-custom)]">
                      Account Status
                    </label>
                    <select
                      value={editData.active ? "active" : "disabled"}
                      onChange={(e) => setEditData({ ...editData, active: e.target.value === "active" })}
                      className="mt-1.5 w-full rounded border rule bg-[var(--bg)] px-3 py-2 font-mono text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                    >
                      <option value="active">Active (Enabled)</option>
                      <option value="disabled">Disabled (No login)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Permissions Checklist */}
              {isAdmin && (
                <div className="rounded border rule bg-[var(--surface-2)] p-4">
                  <label className="block font-mono text-xs font-semibold text-[var(--ink)] uppercase">
                    Permissions Allocation
                  </label>
                  <div className="mt-3 grid grid-cols-2 gap-3 font-mono text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editData.permissions.create}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            permissions: { ...editData.permissions, create: e.target.checked },
                          })
                        }
                        className="rounded accent-[var(--brass)]"
                      />
                      <span>Create Access</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editData.permissions.read}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            permissions: { ...editData.permissions, read: e.target.checked },
                          })
                        }
                        className="rounded accent-[var(--brass)]"
                      />
                      <span>Read Access</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editData.permissions.update}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            permissions: { ...editData.permissions, update: e.target.checked },
                          })
                        }
                        className="rounded accent-[var(--brass)]"
                      />
                      <span>Update Access</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editData.permissions.delete}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            permissions: { ...editData.permissions, delete: e.target.checked },
                          })
                        }
                        className="rounded accent-[var(--brass)]"
                      />
                      <span>Delete Access</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="rounded border rule px-4 py-2 font-mono text-xs text-[var(--ink)] hover:bg-[var(--surface-2)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-brass rounded px-5 py-2 text-xs font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
