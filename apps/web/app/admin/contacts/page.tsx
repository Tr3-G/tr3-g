"use client"

import * as React from "react"
import { MessageSquare, Trash2, Filter } from "lucide-react"
import { useAdminAuth } from "@/hooks/use-admin-auth"

export default function AdminContactsPage() {
  const { canUpdate, canDelete } = useAdminAuth()
  const [items, setItems] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [error, setError] = React.useState("")
  const [success, setSuccess] = React.useState("")

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/contacts")
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

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "Failed to update status")
      }
      setItems((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status: newStatus } : item))
      )
      setSuccess("Contact message status updated.")
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete message from ${name}?`)) return
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "Failed to delete")
      }
      setSuccess("Contact message deleted.")
      setItems((prev) => prev.filter((item) => item._id !== id))
    } catch (err: any) {
      setError(err.message)
    }
  }

  const filteredItems = items.filter((item) => {
    if (statusFilter === "all") return true
    return item.status === statusFilter
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b rule pb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide teal-text">COMMUNICATION PIPELINE</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Contact Inquiries</h1>
          <p className="mt-1 text-sm text-[var(--muted-custom)]">
            Incoming partner requests, project consultations, and SLA inquiries from the contact form.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[var(--muted-custom)]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded border rule bg-[var(--surface)] px-3 py-1.5 font-mono text-xs text-[var(--ink)] outline-none focus:border-[var(--brass)]"
          >
            <option value="all">All Inquiries ({items.length})</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">{error}</div>
      )}
      {success && (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400">{success}</div>
      )}

      {/* Messages Feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="rounded-lg border rule bg-[var(--surface)] p-8 text-center font-mono text-xs text-[var(--muted-custom)]">
            Loading contact inquiries...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-lg border rule bg-[var(--surface)] p-8 text-center font-mono text-xs text-[var(--muted-custom)]">
            No contact messages match the current filter.
          </div>
        ) : (
          filteredItems.map((contact) => (
            <article
              key={contact._id}
              className="rounded-lg border rule bg-[var(--surface)] p-6 transition-all hover:border-[var(--brass)]"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b rule pb-4">
                <div>
                  <h3 className="font-display text-xl font-bold text-[var(--ink)]">{contact.name}</h3>
                  <div className="mt-1 font-mono text-xs text-[var(--muted-custom)] flex flex-wrap gap-2 items-center">
                    {contact.organization && <span>{contact.organization} ·</span>}
                    <span className="text-[var(--ink)]">{contact.email}</span>
                    {contact.phone && <span>· {contact.phone}</span>}
                  </div>
                  {contact.topic && (
                    <div className="mt-2 inline-flex rounded bg-[var(--brass)]/15 px-2 py-0.5 font-mono text-[11px] brass-text border border-[var(--brass)]/30 font-semibold">
                      Topic: {contact.topic}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={contact.status}
                    disabled={!canUpdate}
                    onChange={(e) => handleStatusChange(contact._id, e.target.value)}
                    className="rounded border rule bg-[var(--bg)] px-3 py-1.5 font-mono text-xs text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                  >
                    <option value="new">new</option>
                    <option value="read">read</option>
                    <option value="replied">replied</option>
                    <option value="archived">archived</option>
                  </select>

                  {canDelete && (
                    <button
                      onClick={() => handleDelete(contact._id, contact.name)}
                      className="rounded border rule p-1.5 text-red-400 hover:border-red-500 hover:bg-red-500/10"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 text-sm text-[var(--ink)] leading-relaxed whitespace-pre-wrap">
                {contact.message}
              </div>

              <div className="mt-4 pt-4 border-t rule flex items-center justify-between font-mono text-[11px] text-[var(--muted-custom)]">
                <span>Received: {new Date(contact.created_at).toLocaleString()}</span>
                <span>ID: {contact._id}</span>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  )
}
