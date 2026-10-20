"use client"

import * as React from "react"
import { GraduationCap, Plus, Edit2, Trash2, CheckCircle2, XCircle } from "lucide-react"
import { useAdminAuth } from "@/hooks/use-admin-auth"

export default function AdminCareersPage() {
  const { canCreate, canUpdate, canDelete } = useAdminAuth()
  const [items, setItems] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [editingItem, setEditingItem] = React.useState<any | null>(null)
  const [showAdd, setShowAdd] = React.useState(false)
  const [error, setError] = React.useState("")
  const [success, setSuccess] = React.useState("")

  const [form, setForm] = React.useState({
    title: "",
    code: "ROLE-01",
    location: "Abuja Operations Hub",
    description: "",
    sort_order: 0,
    active: true,
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/content/career")
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const payload = {
        title: form.title,
        body: form.location,
        meta: {
          code: form.code,
          location: form.location,
        },
        description: form.description,
        sort_order: form.sort_order,
        active: form.active,
      }

      const url = editingItem
        ? `/api/admin/content/career/${editingItem._id}`
        : "/api/admin/content/career"
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

      setSuccess(editingItem ? "Role position updated." : "Career opportunity created.")
      setEditingItem(null)
      setShowAdd(false)
      setForm({
        title: "",
        code: `ROLE-${String(items.length + 2).padStart(2, "0")}`,
        location: "Abuja Operations Hub",
        description: "",
        sort_order: items.length,
        active: true,
      })
      await loadData()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this career listing?")) return
    setError("")
    setSuccess("")
    try {
      const res = await fetch(`/api/admin/content/career/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "Failed to delete")
      }
      setSuccess("Career listing deleted.")
      await loadData()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const startEdit = (item: any) => {
    setEditingItem(item)
    setForm({
      title: item.title,
      code: item.meta?.code || "ROLE-01",
      location: item.meta?.location || item.body || "Abuja",
      description: item.description || "",
      sort_order: item.sort_order || 0,
      active: item.active !== false,
    })
    setShowAdd(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b rule pb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide teal-text">ENGINEERING TALENT</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Careers Management</h1>
          <p className="mt-1 text-sm text-[var(--muted-custom)]">
            Publish open roles for engineering, security, and systems architecture.
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => {
              setEditingItem(null)
              setForm({
                title: "",
                code: `ROLE-${String(items.length + 1).padStart(2, "0")}`,
                location: "Abuja Operations Hub",
                description: "",
                sort_order: items.length,
                active: true,
              })
              setShowAdd(true)
            }}
            className="btn-brass inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold"
          >
            <Plus className="h-4 w-4" />
            <span>Add Role</span>
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">{error}</div>
      )}
      {success && (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400">{success}</div>
      )}

      {/* Table */}
      <div className="rounded-lg border rule bg-[var(--surface)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b rule bg-[var(--surface-2)] font-mono text-xs text-[var(--muted-custom)] uppercase">
              <tr>
                <th className="px-6 py-3.5">Code</th>
                <th className="px-6 py-3.5">Position Title</th>
                <th className="px-6 py-3.5">Location</th>
                <th className="px-6 py-3.5">Description</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y rule">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center font-mono text-xs text-[var(--muted-custom)]">
                    Loading career listings...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center font-mono text-xs text-[var(--muted-custom)]">
                    No open positions configured.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id} className="hover:bg-[var(--surface-2)]/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-[var(--teal)] font-semibold">
                      {item.meta?.code || "ROLE"}
                    </td>
                    <td className="px-6 py-4 font-semibold text-[var(--ink)]">{item.title}</td>
                    <td className="px-6 py-4 text-xs text-[var(--muted-custom)]">
                      {item.meta?.location || item.body || "Abuja"}
                    </td>
                    <td className="px-6 py-4 text-xs text-[var(--muted-custom)] max-w-sm line-clamp-2">
                      {item.description}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      {item.active ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Recruiting
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-zinc-500">
                          <XCircle className="h-3.5 w-3.5" /> Closed
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
          <div className="w-full max-w-lg rounded-lg border rule-strong bg-[var(--surface)] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b rule pb-4">
              <h2 className="font-display text-xl font-bold">
                {editingItem ? "Edit Role Position" : "Add Career Opportunity"}
              </h2>
              <button onClick={() => setShowAdd(false)} className="text-[var(--muted-custom)] hover:text-[var(--ink)]">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block font-mono text-xs text-[var(--muted-custom)]">Position Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Principal Distributed Systems Engineer"
                  className="mt-1.5 w-full rounded border rule bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-[var(--muted-custom)]">Role Code</label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="e.g. ROLE-01"
                    className="mt-1.5 w-full rounded border rule bg-[var(--bg)] px-3 py-2 font-mono text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-[var(--muted-custom)]">Location</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Abuja / Hybrid / Remote"
                    className="mt-1.5 w-full rounded border rule bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs text-[var(--muted-custom)]">Role Specifications *</label>
                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Key responsibilities, stack requirements, and institutional objectives..."
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
                  <span>Accepting Applications</span>
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
                  {editingItem ? "Save Changes" : "Create Career Listing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
