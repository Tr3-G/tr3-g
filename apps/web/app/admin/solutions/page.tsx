"use client"

import * as React from "react"
import { Cpu, Plus, Edit2, Trash2, CheckCircle2, XCircle, ExternalLink, Link as LinkIcon } from "lucide-react"
import { useAdminAuth } from "@/hooks/use-admin-auth"

export default function AdminSolutionsPage() {
  const { canCreate, canUpdate, canDelete } = useAdminAuth()
  const [items, setItems] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [editingItem, setEditingItem] = React.useState<any | null>(null)
  const [showAdd, setShowAdd] = React.useState(false)
  const [error, setError] = React.useState("")
  const [success, setSuccess] = React.useState("")

  const [form, setForm] = React.useState({
    title: "",
    description: "",
    status: "ACTIVE",
    link: "",
    sort_order: 0,
    active: true,
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/content/solution")
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

  const handleToggleStatus = async (item: any) => {
    if (!canUpdate) return
    const currentStatus = item.meta?.status || "ACTIVE"
    const nextStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE"

    try {
      const payload = {
        meta: {
          ...item.meta,
          status: nextStatus,
        },
      }
      const res = await fetch(`/api/admin/content/solution/${item._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "Failed to update status")
      }
      setItems((prev) =>
        prev.map((i) =>
          i._id === item._id ? { ...i, meta: { ...i.meta, status: nextStatus } } : i
        )
      )
      setSuccess(`Status for ${item.title} toggled to ${nextStatus}.`)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const payload = {
        title: form.title,
        description: form.description,
        meta: {
          status: form.status,
          link: form.link.trim() || undefined,
          url: form.link.trim() || undefined,
        },
        sort_order: form.sort_order,
        active: form.active,
      }

      const url = editingItem
        ? `/api/admin/content/solution/${editingItem._id}`
        : "/api/admin/content/solution"
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

      setSuccess(editingItem ? "Solution updated." : "Solution created.")
      setEditingItem(null)
      setShowAdd(false)
      setForm({ title: "", description: "", status: "ACTIVE", link: "", sort_order: 0, active: true })
      await loadData()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this solution?")) return
    setError("")
    setSuccess("")
    try {
      const res = await fetch(`/api/admin/content/solution/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "Failed to delete")
      }
      setSuccess("Solution deleted.")
      await loadData()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const startEdit = (item: any) => {
    setEditingItem(item)
    setForm({
      title: item.title,
      description: item.description || "",
      status: item.meta?.status || "ACTIVE",
      link: item.meta?.link || item.meta?.url || "",
      sort_order: item.sort_order || 0,
      active: item.active !== false,
    })
    setShowAdd(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b rule pb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide teal-text">PRODUCTION ECOSYSTEMS</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Solutions Management</h1>
          <p className="mt-1 text-sm text-[var(--muted-custom)]">
            Manage deployed platforms, platform links/URLs, and toggle active deployment states.
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => {
              setEditingItem(null)
              setForm({
                title: "",
                description: "",
                status: "ACTIVE",
                link: "",
                sort_order: items.length,
                active: true,
              })
              setShowAdd(true)
            }}
            className="btn-brass inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold"
          >
            <Plus className="h-4 w-4" />
            <span>Add Solution</span>
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

      {/* Solutions List Table */}
      <div className="rounded-lg border rule bg-[var(--surface)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b rule bg-[var(--surface-2)] font-mono text-xs text-[var(--muted-custom)] uppercase">
              <tr>
                <th className="px-6 py-3.5">Solution Name</th>
                <th className="px-6 py-3.5">Deployment Status (Toggle)</th>
                <th className="px-6 py-3.5">Platform Link / URL</th>
                <th className="px-6 py-3.5">Description</th>
                <th className="px-6 py-3.5">Visibility</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y rule">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center font-mono text-xs text-[var(--muted-custom)]">
                    Loading solutions...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center font-mono text-xs text-[var(--muted-custom)]">
                    No solutions configured.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isActiveStatus = (item.meta?.status || "ACTIVE") === "ACTIVE"
                  const itemLink = item.meta?.link || item.meta?.url

                  return (
                    <tr key={item._id} className="hover:bg-[var(--surface-2)]/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-[var(--ink)] text-base">{item.title}</div>
                        <div className="font-mono text-[11px] text-[var(--muted-custom)] mt-0.5">
                          /{item.slug}
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="px-6 py-4">
                        {canUpdate ? (
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(item)}
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs font-semibold uppercase transition-all shadow-sm ${
                              isActiveStatus
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30"
                                : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700"
                            }`}
                            title="Click to toggle status"
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${
                                isActiveStatus ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"
                              }`}
                            />
                            <span>{item.meta?.status || "ACTIVE"}</span>
                          </button>
                        ) : (
                          <span className="inline-flex rounded border rule px-2 py-0.5 font-mono text-xs text-[var(--teal)] bg-[var(--surface-2)]">
                            {item.meta?.status || "ACTIVE"}
                          </span>
                        )}
                      </td>

                      {/* Link / URL Field */}
                      <td className="px-6 py-4 font-mono text-xs">
                        {itemLink ? (
                          <a
                            href={itemLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 brass-text hover:underline max-w-xs truncate"
                          >
                            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{itemLink}</span>
                          </a>
                        ) : (
                          <span className="text-[var(--muted-custom)] italic">No URL set</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-xs text-[var(--muted-custom)] max-w-xs line-clamp-2">
                        {item.description}
                      </td>

                      <td className="px-6 py-4 font-mono text-xs">
                        {item.active ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Live
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
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-lg border rule-strong bg-[var(--surface)] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b rule pb-4">
              <h2 className="font-display text-xl font-bold">
                {editingItem ? "Edit Solution" : "Add Solution"}
              </h2>
              <button
                onClick={() => setShowAdd(false)}
                className="text-[var(--muted-custom)] hover:text-[var(--ink)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block font-mono text-xs text-[var(--muted-custom)]">
                  Platform Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Arqelion Access"
                  className="mt-1.5 w-full rounded border rule bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                />
              </div>

              {/* Status Toggle in Modal */}
              <div>
                <label className="block font-mono text-xs text-[var(--muted-custom)] mb-1.5">
                  Deployment Status Toggle
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        status: form.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                      })
                    }
                    className={`inline-flex items-center gap-2 rounded px-4 py-2 font-mono text-xs font-semibold uppercase border transition-colors ${
                      form.status === "ACTIVE"
                        ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-400"
                        : "border-zinc-700 bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        form.status === "ACTIVE" ? "bg-emerald-400" : "bg-zinc-500"
                      }`}
                    />
                    <span>Status: {form.status}</span>
                  </button>
                  <span className="font-mono text-[11px] text-[var(--muted-custom)]">
                    Click to switch between ACTIVE and INACTIVE
                  </span>
                </div>
              </div>

              {/* Link / URL (optional) */}
              <div>
                <label className="block font-mono text-xs text-[var(--muted-custom)]">
                  Platform Link / URL (Optional)
                </label>
                <div className="relative mt-1.5">
                  <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-[var(--muted-custom)]" />
                  <input
                    type="url"
                    value={form.link}
                    onChange={(e) => setForm({ ...form, link: e.target.value })}
                    placeholder="https://access.tr3-g.com.ng"
                    className="w-full rounded border rule bg-[var(--bg)] py-2 pl-9 pr-3 font-mono text-xs text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs text-[var(--muted-custom)]">
                  Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Architecture overview and security model..."
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
                  {editingItem ? "Save Changes" : "Create Solution"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
