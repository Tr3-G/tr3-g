"use client"

import * as React from "react"
import {
  Images,
  Plus,
  Trash2,
  Edit2,
  Video,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Upload,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Film,
} from "lucide-react"
import { useAdminAuth } from "@/hooks/use-admin-auth"

interface GalleryMedia {
  _id: string
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
}

export default function AdminGalleryPage() {
  const { canCreate, canUpdate, canDelete } = useAdminAuth()
  const [items, setItems] = React.useState<GalleryMedia[]>([])
  const [loading, setLoading] = React.useState(true)
  const [showModal, setShowModal] = React.useState(false)
  const [editingItem, setEditingItem] = React.useState<GalleryMedia | null>(null)
  const [uploading, setUploading] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState("")
  const [error, setError] = React.useState("")
  const [success, setSuccess] = React.useState("")

  const [form, setForm] = React.useState({
    title: "",
    description: "",
    media_url: "",
    media_type: "image" as "image" | "video",
    is_public: true,
    sort_order: 0,
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/gallery")
      if (res.ok) {
        setItems(await res.json())
      }
    } catch (err: any) {
      setError(err.message || "Failed to load gallery")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadData()
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadProgress("Uploading to Cloudinary...")
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "tr3g/gallery")

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Upload failed")
      }

      const isVideo = file.type.startsWith("video/")
      setForm((prev) => ({
        ...prev,
        media_url: data.secure_url || data.url,
        media_type: isVideo ? "video" : "image",
        title: prev.title || file.name.replace(/\.[^/.]+$/, ""),
      }))
      setSuccess("File uploaded successfully.")
    } catch (err: any) {
      setError("Upload failed: " + err.message)
    } finally {
      setUploading(false)
      setUploadProgress("")
    }
  }

  const handleTogglePublic = async (item: GalleryMedia) => {
    if (!canUpdate) return
    const newStatus = !item.is_public
    try {
      const res = await fetch(`/api/admin/gallery/${item._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_public: newStatus }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "Failed to update visibility")
      }
      setItems((prev) =>
        prev.map((i) => (i._id === item._id ? { ...i, is_public: newStatus } : i))
      )
      setSuccess(`Item is now ${newStatus ? "Public" : "Private"}.`)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.media_url.trim()) {
      setError("Media URL or uploaded file is required")
      return
    }

    setError("")
    setSuccess("")

    try {
      const url = editingItem
        ? `/api/admin/gallery/${editingItem._id}`
        : "/api/admin/gallery"
      const method = editingItem ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "Operation failed")
      }

      setSuccess(editingItem ? "Media item updated." : "Media item added to gallery.")
      setShowModal(false)
      setEditingItem(null)
      setForm({
        title: "",
        description: "",
        media_url: "",
        media_type: "image",
        is_public: true,
        sort_order: 0,
      })
      await loadData()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}" from the gallery?`)) return
    setError("")
    setSuccess("")

    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "Failed to delete item")
      }
      setSuccess("Media item deleted.")
      setItems((prev) => prev.filter((i) => i._id !== id))
    } catch (err: any) {
      setError(err.message)
    }
  }

  const startEdit = (item: GalleryMedia) => {
    setEditingItem(item)
    setForm({
      title: item.title,
      description: item.description || "",
      media_url: item.media_url,
      media_type: item.media_type,
      is_public: item.is_public !== false,
      sort_order: item.sort_order || 0,
    })
    setShowModal(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b rule pb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide teal-text">MEDIA ASSETS</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Gallery Management</h1>
          <p className="mt-1 text-sm text-[var(--muted-custom)]">
            Upload institutional imagery, event recordings, architecture showcases, and manage their public visibility.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => {
              setEditingItem(null)
              setForm({
                title: "",
                description: "",
                media_url: "",
                media_type: "image",
                is_public: true,
                sort_order: items.length,
              })
              setShowModal(true)
            }}
            className="btn-brass inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold"
          >
            <Plus className="h-4 w-4" />
            <span>Upload Media</span>
          </button>
        )}
      </div>

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

      {/* Gallery Cards Grid */}
      {loading ? (
        <div className="py-16 text-center font-mono text-xs text-[var(--muted-custom)]">
          Loading gallery items...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border rule bg-[var(--surface)] p-12 text-center">
          <Film className="mx-auto h-10 w-10 text-[var(--muted-custom)] opacity-50" />
          <h3 className="mt-3 font-display text-lg font-bold">No gallery items uploaded yet</h3>
          <p className="mt-1 text-xs text-[var(--muted-custom)]">
            Upload photos, platform screencasts, or videos using Cloudinary storage.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item._id}
              className="rounded-lg border rule bg-[var(--surface)] overflow-hidden shadow-sm flex flex-col justify-between hover:border-[var(--brass)] transition-colors"
            >
              <div>
                {/* Media Preview Box */}
                <div className="relative aspect-video w-full bg-[var(--bg)] border-b rule overflow-hidden flex items-center justify-center">
                  {item.media_type === "video" ? (
                    <video
                      src={item.media_url}
                      controls
                      preload="metadata"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <img
                      src={item.media_url}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  )}

                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[10px] font-semibold uppercase ${
                        item.media_type === "video"
                          ? "bg-purple-500/20 text-purple-400 border border-purple-500/40"
                          : "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                      }`}
                    >
                      {item.media_type === "video" ? (
                        <Video className="h-3 w-3" />
                      ) : (
                        <ImageIcon className="h-3 w-3" />
                      )}
                      {item.media_type}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    {canUpdate ? (
                      <button
                        onClick={() => handleTogglePublic(item)}
                        className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[10px] font-semibold uppercase transition-colors shadow-sm ${
                          item.is_public
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30"
                            : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700"
                        }`}
                        title="Click to toggle Public / Private"
                      >
                        {item.is_public ? (
                          <>
                            <Eye className="h-3 w-3" /> Public
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3" /> Private
                          </>
                        )}
                      </button>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[10px] uppercase ${
                          item.is_public ? "text-emerald-400" : "text-zinc-500"
                        }`}
                      >
                        {item.is_public ? "Public" : "Private"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="font-display text-base font-bold text-[var(--ink)] line-clamp-1">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="mt-1 text-xs text-[var(--muted-custom)] line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between font-mono text-[11px] text-[var(--muted-custom)] border-t rule pt-2.5">
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    <a
                      href={item.media_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 teal-text hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" /> Source
                    </a>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="border-t rule px-5 py-3 bg-[var(--surface-2)] flex items-center justify-between">
                <span className="font-mono text-[10px] text-[var(--muted-custom)]">
                  Visibility: <strong className={item.is_public ? "text-emerald-400" : "text-zinc-400"}>{item.is_public ? "Public (Live)" : "Private (Draft)"}</strong>
                </span>

                <div className="flex items-center gap-2">
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
                      onClick={() => handleDelete(item._id, item.title)}
                      className="rounded border rule p-1.5 text-red-400 hover:border-red-500 hover:bg-red-500/10"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-lg border rule-strong bg-[var(--surface)] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b rule pb-4">
              <h2 className="font-display text-xl font-bold">
                {editingItem ? "Edit Gallery Item" : "Upload to Gallery"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-[var(--muted-custom)] hover:text-[var(--ink)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block font-mono text-xs text-[var(--muted-custom)]">
                  Media Title *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Arqelion Access Deployment Demonstration"
                  className="mt-1.5 w-full rounded border rule bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-[var(--muted-custom)]">
                  Media Type
                </label>
                <div className="mt-1.5 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, media_type: "image" })}
                    className={`flex items-center justify-center gap-2 rounded border rule px-3 py-2 font-mono text-xs transition-colors ${
                      form.media_type === "image"
                        ? "border-[var(--brass)] bg-[var(--brass)]/15 font-semibold text-[var(--brass)]"
                        : "text-[var(--muted-custom)] hover:bg-[var(--surface-2)]"
                    }`}
                  >
                    <ImageIcon className="h-4 w-4" /> Image
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, media_type: "video" })}
                    className={`flex items-center justify-center gap-2 rounded border rule px-3 py-2 font-mono text-xs transition-colors ${
                      form.media_type === "video"
                        ? "border-[var(--brass)] bg-[var(--brass)]/15 font-semibold text-[var(--brass)]"
                        : "text-[var(--muted-custom)] hover:bg-[var(--surface-2)]"
                    }`}
                  >
                    <Video className="h-4 w-4" /> Video
                  </button>
                </div>
              </div>

              {/* Cloudinary Upload Field */}
              <div>
                <label className="block font-mono text-xs text-[var(--muted-custom)]">
                  Upload File (via Cloudinary)
                </label>
                <div className="mt-1.5 flex items-center gap-3">
                  <label className="btn-outline inline-flex cursor-pointer items-center gap-2 rounded px-3 py-2 font-mono text-xs">
                    <Upload className="h-3.5 w-3.5" />
                    <span>Choose File</span>
                    <input
                      type="file"
                      accept={form.media_type === "video" ? "video/*" : "image/*"}
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                  {uploading && (
                    <span className="font-mono text-xs teal-text animate-pulse">
                      {uploadProgress || "Uploading..."}
                    </span>
                  )}
                </div>
              </div>

              {/* Direct Media URL */}
              <div>
                <label className="block font-mono text-xs text-[var(--muted-custom)]">
                  Media URL (Cloudinary / Direct Link) *
                </label>
                <input
                  type="url"
                  required
                  value={form.media_url}
                  onChange={(e) => setForm({ ...form, media_url: e.target.value })}
                  placeholder="https://res.cloudinary.com/..."
                  className="mt-1.5 w-full rounded border rule bg-[var(--bg)] px-3 py-2 font-mono text-xs text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-[var(--muted-custom)]">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Context, event, or platform architecture notes..."
                  className="mt-1.5 w-full rounded border rule bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                />
              </div>

              {/* Public Boolean Feature */}
              <div className="flex items-center justify-between rounded border rule bg-[var(--surface-2)] p-3">
                <div>
                  <p className="font-mono text-xs font-semibold text-[var(--ink)]">Public Visibility</p>
                  <p className="text-[11px] text-[var(--muted-custom)]">
                    Make this media visible in the public gallery or showcase.
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={form.is_public}
                    onChange={(e) => setForm({ ...form, is_public: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--brass)]"></div>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded border rule px-4 py-2 font-mono text-xs text-[var(--ink)] hover:bg-[var(--surface-2)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="btn-brass rounded px-5 py-2 text-xs font-semibold disabled:opacity-50"
                >
                  {editingItem ? "Save Changes" : "Save Media"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
