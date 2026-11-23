"use client"

import * as React from "react"
import { Handshake, Plus, Edit2, Trash2, CheckCircle2, XCircle, Upload, Shield, Image as ImageIcon } from "lucide-react"
import { useAdminAuth } from "@/hooks/use-admin-auth"

export default function AdminPartnersPage() {
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
    code: "ALL-01",
    category: "Strategic Alliance",
    featured: "no",
    description: "",
    image_id: "" as string | null,
    sort_order: 0,
    active: true,
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/content/partner")
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
      formData.append("folder", "tr3g/partners")

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload logo")
      }

      const imageUrl = data.secure_url || data.url || data.id
      setForm((prev) => ({
        ...prev,
        image_id: imageUrl,
      }))
    } catch (err: any) {
      setError("Logo upload failed: " + err.message)
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
        body: form.category,
        meta: {
          code: form.code,
          category: form.category,
          featured: form.featured,
        },
        description: form.description,
        image_id: form.image_id,
        sort_order: form.sort_order,
        active: form.active,
      }

      const url = editingItem
        ? `/api/admin/content/partner/${editingItem._id}`
        : "/api/admin/content/partner"
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

      setSuccess(editingItem ? "Partner alliance updated." : "Partner alliance added.")
      setEditingItem(null)
      setShowAdd(false)
      setForm({
        title: "",
        code: "ALL-01",
        category: "Strategic Alliance",
        featured: "no",
        description: "",
        image_id: null,
        sort_order: 0,
        active: true,
      })
      await loadData()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this partner alliance?")) return
    setError("")
    setSuccess("")
    try {
      const res = await fetch(`/api/admin/content/partner/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "Failed to delete")
      }
      setSuccess("Partner alliance removed.")
      await loadData()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const startEdit = (item: any) => {
    setEditingItem(item)
    setForm({
      title: item.title,
      code: item.meta?.code || "ALL-01",
      category: item.meta?.category || item.body || "Strategic Alliance",
      featured: item.meta?.featured || "no",
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
          <p className="font-mono text-xs uppercase tracking-wide teal-text">INSTITUTIONAL ALLIANCES</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Partners Management</h1>
          <p className="mt-1 text-sm text-[var(--muted-custom)]">
            Manage public sector relationships, state revenue alliances, and technical partnerships.
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => {
              setEditingItem(null)
              setForm({
                title: "",
                code: `ALL-${String(items.length + 1).padStart(2, "0")}`,
                category: "Strategic Alliance",
                featured: "no",
                description: "",
                image_id: null,
                sort_order: items.length,
                active: true,
              })
              setShowAdd(true)
            }}
            className="btn-brass inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold"
          >
            <Plus className="h-4 w-4" />
            <span>Add Alliance</span>
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">{error}</div>
      )}
      {success && (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400">{success}</div>
      )}

      {/* Partners List */}
      <div className="rounded-lg border rule bg-[var(--surface)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b rule bg-[var(--surface-2)] font-mono text-xs text-[var(--muted-custom)] uppercase">
              <tr>
                <th className="px-6 py-3.5">Logo</th>
                <th className="px-6 py-3.5">Alliance Name</th>
                <th className="px-6 py-3.5">Code & Track</th>
                <th className="px-6 py-3.5">Type</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y rule">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center font-mono text-xs text-[var(--muted-custom)]">
                    Loading alliances...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center font-mono text-xs text-[var(--muted-custom)]">
                    No alliances configured.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id} className="hover:bg-[var(--surface-2)]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="h-10 w-10 rounded border rule bg-[var(--surface-2)] flex items-center justify-center overflow-hidden">
                        {item.image_id ? (
                          <img
                            src={item.image_id.startsWith("http") ? item.image_id : `/api/images/${item.image_id}`}
                            alt={item.title}
                            className="h-full w-full object-contain p-1"
                          />
                        ) : (
                          <Handshake className="h-5 w-5 brass-text opacity-70" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[var(--ink)]">{item.title}</div>
                      <div className="text-xs text-[var(--muted-custom)] mt-0.5 line-clamp-1 max-w-sm">
                        {item.description}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs text-[var(--teal)] font-semibold">{item.meta?.code || "ALL"}</div>
                      <div className="text-xs text-[var(--muted-custom)]">{item.meta?.category || item.body}</div>
                    </td>
                    <td className="px-6 py-4">
                      {item.meta?.featured === "yes" ? (
                        <span className="inline-flex rounded bg-[var(--brass)]/20 px-2 py-0.5 font-mono text-[10px] uppercase font-bold text-[var(--brass)] border border-[var(--brass)]/40">
                          Featured
                        </span>
                      ) : (
                        <span className="inline-flex rounded border rule px-2 py-0.5 font-mono text-[10px] uppercase text-[var(--muted-custom)]">
                          Standard
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      {item.active ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-zinc-500">
                          <XCircle className="h-3.5 w-3.5" /> Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canUpdate && (
                          <button
                            onClick={() => startEdit(item)}
                            className="rounded border rule p-1.5 text-[var(--ink)] hover:border-[var(--brass)] hover:text-[var(--brass)]"
                            title="Edit"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="rounded border rule p-1.5 text-red-400 hover:border-red-500 hover:bg-red-500/10"
                            title="Delete"
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

      {/* Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-lg border rule-strong bg-[var(--surface)] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b rule pb-4">
              <h2 className="font-display text-xl font-bold">
                {editingItem ? "Edit Partner Alliance" : "Add Partner Alliance"}
              </h2>
              <button onClick={() => setShowAdd(false)} className="text-[var(--muted-custom)] hover:text-[var(--ink)]">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block font-mono text-xs text-[var(--muted-custom)]">Alliance / Partner Name *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Ogun State Internal Revenue Service (OGIRS)"
                  className="mt-1.5 w-full rounded border rule bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-[var(--muted-custom)]">Alliance Code</label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="e.g. ALL-PS, FEAT-OGIRS"
                    className="mt-1.5 w-full rounded border rule bg-[var(--bg)] px-3 py-2 font-mono text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-[var(--muted-custom)]">Category / Sector</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="e.g. Public Sector, Innovation Hub"
                    className="mt-1.5 w-full rounded border rule bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs text-[var(--muted-custom)]">Alliance Tier</label>
                <select
                  value={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.value })}
                  className="mt-1.5 w-full rounded border rule bg-[var(--bg)] px-3 py-2 font-mono text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                >
                  <option value="no">Standard Alliance</option>
                  <option value="yes">Featured Alliance (Expanded 2-column spotlight)</option>
                </select>
              </div>

              {/* Logo Upload (Cloudinary) */}
              <div>
                <label className="block font-mono text-xs text-[var(--muted-custom)]">
                  Partner Logo (Cloudinary Upload)
                </label>
                <div className="mt-2 flex items-center gap-4">
                  {form.image_id ? (
                    <div className="relative h-14 w-14 shrink-0 rounded border rule bg-[var(--surface-2)] p-1 overflow-hidden">
                      <img
                        src={form.image_id.startsWith("http") ? form.image_id : `/api/images/${form.image_id}`}
                        alt="Preview"
                        className="h-full w-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, image_id: null })}
                        className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs text-white opacity-0 hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="h-14 w-14 shrink-0 rounded border rule bg-[var(--surface-2)] flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-[var(--muted-custom)] opacity-50" />
                    </div>
                  )}

                  <label className="btn-outline flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-xs font-mono">
                    <Upload className="h-4 w-4" />
                    <span>{uploadingImage ? "Uploading to Cloudinary..." : "Upload Logo (Cloudinary)"}</span>
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
                <label className="block font-mono text-xs text-[var(--muted-custom)]">Description *</label>
                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Details of the joint enterprise platform or alliance deployment..."
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
                  {editingItem ? "Save Changes" : "Create Partner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
