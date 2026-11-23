"use client"

import * as React from "react"
import { Users, Plus, Edit2, Trash2, CheckCircle2, XCircle, Upload, Image as ImageIcon } from "lucide-react"
import { useAdminAuth } from "@/hooks/use-admin-auth"

export default function AdminTeamPage() {
  const { canCreate, canUpdate, canDelete } = useAdminAuth()
  const [items, setItems] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [editingItem, setEditingItem] = React.useState<any | null>(null)
  const [showAdd, setShowAdd] = React.useState(false)
  const [uploadingImage, setUploadingImage] = React.useState(false)
  const [error, setError] = React.useState("")
  const [success, setSuccess] = React.useState("")

  const [form, setForm] = React.useState({
    title: "",
    role: "",
    description: "",
    image_id: "" as string | null,
    sort_order: 0,
    active: true,
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/content/team")
      if (res.ok) {
        setItems(await res.json())
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadData()
  }, [])

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "tr3g/team")

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload image")
      }

      const imageUrl = data.secure_url || data.url || data.id
      setForm((prev) => ({
        ...prev,
        image_id: imageUrl,
      }))
    } catch (err: any) {
      setError("Image upload failed: " + err.message)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const payload = {
        title: form.title,
        body: form.role,
        meta: { role: form.role },
        description: form.description,
        image_id: form.image_id,
        sort_order: form.sort_order,
        active: form.active,
      }

      const url = editingItem
        ? `/api/admin/content/team/${editingItem._id}`
        : "/api/admin/content/team"
      const method = editingItem ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "Operation failed")
      }

      setSuccess(editingItem ? "Team member updated." : "Team member added.")
      setEditingItem(null)
      setShowAdd(false)
      setForm({ title: "", role: "", description: "", image_id: null, sort_order: 0, active: true })
      await loadData()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this team member?")) return
    setError("")
    setSuccess("")
    try {
      const res = await fetch(`/api/admin/content/team/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "Failed to delete")
      }
      setSuccess("Team member removed.")
      await loadData()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const startEdit = (item: any) => {
    setEditingItem(item)
    setForm({
      title: item.title,
      role: item.meta?.role || item.body || "",
      description: item.description || "",
      image_id: item.image_id || null,
      sort_order: item.sort_order || 0,
      active: item.active !== false,
    })
    setShowAdd(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b rule pb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide teal-text">ENGINEERING & LEADERSHIP</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Team Management</h1>
          <p className="mt-1 text-sm text-[var(--muted-custom)]">
            Manage executive leadership and principal engineers. Member photos are stored as binary bytes.
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => {
              setEditingItem(null)
              setForm({ title: "", role: "", description: "", image_id: null, sort_order: items.length, active: true })
              setShowAdd(true)
            }}
            className="btn-brass inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold"
          >
            <Plus className="h-4 w-4" />
            <span>Add Team Member</span>
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">{error}</div>
      )}
      {success && (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400">{success}</div>
      )}

      {/* Grid of Team Members */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-12 text-center font-mono text-xs text-[var(--muted-custom)]">
            Loading team members...
          </div>
        ) : items.length === 0 ? (
          <div className="col-span-full py-12 text-center font-mono text-xs text-[var(--muted-custom)]">
            No team members added yet.
          </div>
        ) : (
          items.map((member) => (
            <div
              key={member._id}
              className="flex flex-col justify-between rounded-lg border rule bg-[var(--surface)] p-5 hover:border-[var(--brass)] transition-colors"
            >
              <div>
                <div className="aspect-square w-full rounded-md border rule bg-[var(--surface-2)] flex items-center justify-center overflow-hidden">
                  {member.image_id ? (
                    <img
                      src={member.image_id.startsWith("http") ? member.image_id : `/api/images/${member.image_id}`}
                      alt={member.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Users className="h-12 w-12 text-[var(--muted-custom)] opacity-50" />
                  )}
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg font-bold text-[var(--ink)]">{member.title}</h3>
                    <span className="font-mono text-[10px] text-[var(--muted-custom)]">
                      {member.active ? (
                        <span className="text-emerald-400">ACTIVE</span>
                      ) : (
                        <span className="text-zinc-500">HIDDEN</span>
                      )}
                    </span>
                  </div>
                  <p className="font-mono text-xs teal-text mt-1">{member.meta?.role || member.body || "Engineer"}</p>
                  <p className="mt-2 text-xs text-[var(--muted-custom)] leading-relaxed line-clamp-3">
                    {member.description}
                  </p>
                </div>
              </div>

              <div className="mt-5 border-t rule pt-4 flex items-center justify-between">
                <span className="font-mono text-[10px] text-[var(--muted-custom)]">
                  Order: {member.sort_order || 0}
                </span>
                <div className="flex gap-2">
                  {canUpdate && (
                    <button
                      onClick={() => startEdit(member)}
                      className="rounded border rule p-1.5 text-[var(--ink)] hover:border-[var(--brass)] hover:text-[var(--brass)]"
                      title="Edit"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(member._id)}
                      className="rounded border rule p-1.5 text-red-400 hover:border-red-500 hover:bg-red-500/10"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-lg border rule-strong bg-[var(--surface)] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b rule pb-4">
              <h2 className="font-display text-xl font-bold">
                {editingItem ? "Edit Team Member" : "Add Team Member"}
              </h2>
              <button onClick={() => setShowAdd(false)} className="text-[var(--muted-custom)] hover:text-[var(--ink)]">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block font-mono text-xs text-[var(--muted-custom)]">Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Dr. Aliyu Abubakar"
                  className="mt-1.5 w-full rounded border rule bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-[var(--muted-custom)]">Role / Designation *</label>
                <input
                  type="text"
                  required
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="e.g. Chief Systems Architect"
                  className="mt-1.5 w-full rounded border rule bg-[var(--bg)] px-3 py-2 font-mono text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                />
              </div>

              {/* Image Upload (Cloudinary) */}
              <div>
                <label className="block font-mono text-xs text-[var(--muted-custom)]">
                  Member Photo (Cloudinary Upload)
                </label>
                <div className="mt-2 flex items-center gap-4">
                  {form.image_id ? (
                    <div className="relative h-16 w-16 shrink-0 rounded border rule overflow-hidden">
                      <img
                        src={form.image_id.startsWith("http") ? form.image_id : `/api/images/${form.image_id}`}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, image_id: null })}
                        className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs text-white opacity-0 hover:opacity-100 transition-opacity"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="h-16 w-16 shrink-0 rounded border rule bg-[var(--surface-2)] flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-[var(--muted-custom)] opacity-50" />
                    </div>
                  )}

                  <label className="btn-outline flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-xs font-mono">
                    <Upload className="h-4 w-4" />
                    <span>{uploadingImage ? "Uploading to Cloudinary..." : "Upload Photo (Cloudinary)"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs text-[var(--muted-custom)]">Biography *</label>
                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Professional background and specialized engineering domains..."
                  className="mt-1.5 w-full rounded border rule bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-[var(--ink)]">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="rounded accent-[var(--brass)]"
                  />
                  <span>Published on Website</span>
                </label>

                <div className="flex items-center gap-2 font-mono text-xs text-[var(--muted-custom)]">
                  <span>Sort Order:</span>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                    className="w-16 rounded border rule bg-[var(--bg)] px-2 py-1 text-center text-xs text-[var(--ink)]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="rounded border rule px-4 py-2 font-mono text-xs text-[var(--ink)] hover:bg-[var(--surface-2)]"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-brass rounded px-5 py-2 text-xs font-semibold">
                  {editingItem ? "Save Changes" : "Save Team Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
