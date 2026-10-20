"use client"

import * as React from "react"
import {
  ClipboardList,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  HelpCircle,
  GripVertical,
} from "lucide-react"
import { useAdminAuth } from "@/hooks/use-admin-auth"

interface FormField {
  id: string
  label: string
  type: "text" | "textarea" | "email" | "tel" | "number" | "select" | "checkbox" | "file"
  placeholder?: string
  required: boolean
  options?: string[]
  helperText?: string
}

interface RecruitmentForm {
  _id: string
  title: string
  code: string
  description: string
  category?: string
  fields: FormField[]
  active: boolean
  created_at: string
}

export default function AdminRecruitmentFormsPage() {
  const { canCreate, canUpdate, canDelete } = useAdminAuth()
  const [forms, setForms] = React.useState<RecruitmentForm[]>([])
  const [loading, setLoading] = React.useState(true)
  const [editingForm, setEditingForm] = React.useState<RecruitmentForm | null>(null)
  const [previewForm, setPreviewForm] = React.useState<RecruitmentForm | null>(null)
  const [showModal, setShowModal] = React.useState(false)
  const [error, setError] = React.useState("")
  const [success, setSuccess] = React.useState("")

  // Form builder state
  const [formData, setFormData] = React.useState<{
    title: string
    code: string
    category: string
    description: string
    active: boolean
    fields: FormField[]
  }>({
    title: "",
    code: "FORM-NEW",
    category: "Engineering",
    description: "",
    active: true,
    fields: [],
  })

  const loadForms = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/forms")
      if (res.ok) {
        setForms(await res.json())
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadForms()
  }, [])

  const startCreate = () => {
    setEditingForm(null)
    setFormData({
      title: "",
      code: `FORM-${String(forms.length + 1).padStart(2, "0")}`,
      category: "Engineering",
      description: "",
      active: true,
      fields: [
        {
          id: `field_${Date.now()}_1`,
          label: "Portfolio / Code Repository URL",
          type: "text",
          placeholder: "https://...",
          required: true,
        },
        {
          id: `field_${Date.now()}_2`,
          label: "Years of Experience in Target Domain",
          type: "number",
          placeholder: "e.g. 5",
          required: true,
        },
      ],
    })
    setShowModal(true)
  }

  const startEdit = (f: RecruitmentForm) => {
    setEditingForm(f)
    setFormData({
      title: f.title,
      code: f.code,
      category: f.category || "General",
      description: f.description || "",
      active: f.active !== false,
      fields: f.fields || [],
    })
    setShowModal(true)
  }

  const addField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      label: "New Question / Field Label",
      type: "text",
      placeholder: "",
      required: false,
      options: [],
    }
    setFormData({
      ...formData,
      fields: [...formData.fields, newField],
    })
  }

  const removeField = (index: number) => {
    setFormData({
      ...formData,
      fields: formData.fields.filter((_, i) => i !== index),
    })
  }

  const updateField = (index: number, updates: Partial<FormField>) => {
    const existing = formData.fields[index]
    if (!existing) return
    const updated = [...formData.fields]
    updated[index] = { ...existing, ...updates }
    setFormData({ ...formData, fields: updated })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const url = editingForm ? `/api/admin/forms/${editingForm._id}` : "/api/admin/forms"
      const method = editingForm ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "Failed to save recruitment form")
      }

      setSuccess(editingForm ? "Recruitment form updated." : "Recruitment form created.")
      setShowModal(false)
      setEditingForm(null)
      await loadForms()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete form "${code}"?`)) return
    setError("")
    setSuccess("")
    try {
      const res = await fetch(`/api/admin/forms/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "Failed to delete")
      }
      setSuccess(`Form "${code}" deleted.`)
      await loadForms()
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b rule pb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide teal-text">APPLICATION ARCHITECTURE</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Recruitment Forms</h1>
          <p className="mt-1 text-sm text-[var(--muted-custom)]">
            Create and configure distinct application forms with custom questions, requirements, and field schemas.
          </p>
        </div>
        {canCreate && (
          <button
            onClick={startCreate}
            className="btn-brass inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold"
          >
            <Plus className="h-4 w-4" />
            <span>Create Recruitment Form</span>
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">{error}</div>
      )}
      {success && (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400">{success}</div>
      )}

      {/* Forms List Table */}
      <div className="rounded-lg border rule bg-[var(--surface)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b rule bg-[var(--surface-2)] font-mono text-xs text-[var(--muted-custom)] uppercase">
              <tr>
                <th className="px-6 py-3.5">Code</th>
                <th className="px-6 py-3.5">Form Name & Track</th>
                <th className="px-6 py-3.5">Description</th>
                <th className="px-6 py-3.5">Custom Fields</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y rule">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center font-mono text-xs text-[var(--muted-custom)]">
                    Loading recruitment forms...
                  </td>
                </tr>
              ) : forms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center font-mono text-xs text-[var(--muted-custom)]">
                    No recruitment forms created yet.
                  </td>
                </tr>
              ) : (
                forms.map((f) => (
                  <tr key={f._id} className="hover:bg-[var(--surface-2)]/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-[var(--brass)]">
                      {f.code}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[var(--ink)]">{f.title}</div>
                      <div className="font-mono text-xs text-[var(--teal)] mt-0.5">{f.category || "General"}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-[var(--muted-custom)] max-w-sm line-clamp-2">
                      {f.description}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      <span className="rounded bg-[var(--surface-2)] px-2 py-0.5 border rule">
                        {f.fields?.length || 0} fields
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      {f.active ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-zinc-500">
                          <XCircle className="h-3.5 w-3.5" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setPreviewForm(f)}
                          className="rounded border rule p-1.5 text-[var(--muted-custom)] hover:text-[var(--ink)] hover:border-[var(--brass)]"
                          title="Preview Form"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        {canUpdate && (
                          <button
                            onClick={() => startEdit(f)}
                            className="rounded border rule p-1.5 text-[var(--ink)] hover:border-[var(--brass)] hover:text-[var(--brass)]"
                            title="Edit"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(f._id, f.code)}
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

      {/* Create / Edit Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-lg border rule-strong bg-[var(--surface)] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b rule pb-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 brass-text" />
                <h2 className="font-display text-xl font-bold">
                  {editingForm ? `Edit Form: ${editingForm.code}` : "Create Recruitment Form"}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-[var(--muted-custom)] hover:text-[var(--ink)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-6">
              {/* Form Metadata */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-mono text-xs text-[var(--muted-custom)]">Form Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Distributed Systems Engineering Form"
                    className="mt-1.5 w-full rounded border rule bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-[var(--muted-custom)]">Form Code</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. FORM-TECH"
                    className="mt-1.5 w-full rounded border rule bg-[var(--bg)] px-3 py-2 font-mono text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-[var(--muted-custom)]">Category Track</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Engineering, Executive, Design"
                    className="mt-1.5 w-full rounded border rule bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-[var(--ink)]">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="rounded accent-[var(--brass)]"
                    />
                    <span>Active & Available for Public Applications</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs text-[var(--muted-custom)]">Instructions / Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Instructions presented to applicants completing this form..."
                  className="mt-1.5 w-full rounded border rule bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                />
              </div>

              {/* Dynamic Field Builder */}
              <div className="border-t rule pt-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-display text-base font-bold text-[var(--ink)]">Configurable Form Fields</h3>
                    <p className="font-mono text-xs text-[var(--muted-custom)]">
                      Standard applicant fields (Full Name, Email, Phone, CV) are always requested. Add specific questions below:
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addField}
                    className="btn-outline inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-mono"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Question / Field</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.fields.length === 0 ? (
                    <div className="rounded border rule bg-[var(--surface-2)]/50 p-6 text-center font-mono text-xs text-[var(--muted-custom)]">
                      No custom fields added yet. Click &quot;Add Question / Field&quot; to customize this recruitment form.
                    </div>
                  ) : (
                    formData.fields.map((field, idx) => (
                      <div
                        key={field.id || idx}
                        className="rounded-md border rule bg-[var(--surface-2)] p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold brass-text">Q{idx + 1}</span>
                            <span className="font-mono text-[10px] text-[var(--muted-custom)] uppercase">
                              [{field.type}]
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeField(idx)}
                            className="text-xs text-red-400 hover:text-red-300 font-mono"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-2">
                            <label className="block font-mono text-[11px] text-[var(--muted-custom)]">
                              Question / Field Label *
                            </label>
                            <input
                              type="text"
                              required
                              value={field.label}
                              onChange={(e) => updateField(idx, { label: e.target.value })}
                              placeholder="e.g. Years of production experience with Go"
                              className="mt-1 w-full rounded border rule bg-[var(--bg)] px-2.5 py-1.5 text-xs text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                            />
                          </div>

                          <div>
                            <label className="block font-mono text-[11px] text-[var(--muted-custom)]">
                              Input Type
                            </label>
                            <select
                              value={field.type}
                              onChange={(e) => updateField(idx, { type: e.target.value as any })}
                              className="mt-1 w-full rounded border rule bg-[var(--bg)] px-2.5 py-1.5 font-mono text-xs text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                            >
                              <option value="text">Text (Single line)</option>
                              <option value="textarea">Textarea (Multi-line paragraph)</option>
                              <option value="number">Number</option>
                              <option value="select">Select Dropdown (Choices)</option>
                              <option value="checkbox">Checkbox (Yes / No confirmation)</option>
                              <option value="file">File Attachment</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-mono text-[11px] text-[var(--muted-custom)]">
                              Placeholder / Input Hint
                            </label>
                            <input
                              type="text"
                              value={field.placeholder || ""}
                              onChange={(e) => updateField(idx, { placeholder: e.target.value })}
                              placeholder="e.g. https://..."
                              className="mt-1 w-full rounded border rule bg-[var(--bg)] px-2.5 py-1.5 text-xs text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                            />
                          </div>

                          <div className="flex items-center pt-5">
                            <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-[var(--ink)]">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) => updateField(idx, { required: e.target.checked })}
                                className="rounded accent-[var(--brass)]"
                              />
                              <span>Mandatory / Required Field</span>
                            </label>
                          </div>
                        </div>

                        {field.type === "select" && (
                          <div>
                            <label className="block font-mono text-[11px] text-[var(--muted-custom)]">
                              Dropdown Options (Comma separated)
                            </label>
                            <input
                              type="text"
                              value={field.options?.join(", ") || ""}
                              onChange={(e) =>
                                updateField(idx, {
                                  options: e.target.value
                                    .split(",")
                                    .map((o) => o.trim())
                                    .filter(Boolean),
                                })
                              }
                              placeholder="Option A, Option B, Option C"
                              className="mt-1 w-full rounded border rule bg-[var(--bg)] px-2.5 py-1.5 font-mono text-xs text-[var(--ink)] outline-none focus:border-[var(--brass)]"
                            />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t rule">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded border rule px-4 py-2 font-mono text-xs text-[var(--ink)] hover:bg-[var(--surface-2)]"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-brass rounded px-6 py-2 text-xs font-semibold">
                  {editingForm ? "Save Changes" : "Create Recruitment Form"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-lg border rule-strong bg-[var(--surface)] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b rule pb-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider teal-text font-bold">
                  Applicant Preview · {previewForm.code}
                </span>
                <h3 className="font-display text-lg font-bold text-[var(--ink)]">{previewForm.title}</h3>
              </div>
              <button
                onClick={() => setPreviewForm(null)}
                className="text-[var(--muted-custom)] hover:text-[var(--ink)]"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-xs text-[var(--muted-custom)] leading-relaxed">
                {previewForm.description || "No specific instructions provided."}
              </p>

              <div className="rounded border rule bg-[var(--bg)] p-4 space-y-4">
                <div className="border-b rule pb-3">
                  <span className="font-mono text-[11px] text-[var(--muted-custom)] uppercase font-semibold">
                    Core Applicant Data (Fixed)
                  </span>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-[var(--muted-custom)]">
                    <div>• Full Name (required)</div>
                    <div>• Email Address (required)</div>
                    <div>• Phone Number</div>
                    <div>• Resume / CV File (required)</div>
                  </div>
                </div>

                <span className="font-mono text-[11px] text-[var(--brass)] uppercase font-semibold block">
                  Custom Form Questions ({previewForm.fields?.length || 0})
                </span>

                {previewForm.fields?.map((f, i) => (
                  <div key={f.id || i} className="space-y-1">
                    <label className="block text-xs font-medium text-[var(--ink)]">
                      {f.label} {f.required && <span className="text-red-400">*</span>}
                    </label>
                    {f.type === "textarea" ? (
                      <div className="rounded border rule bg-[var(--surface)] p-2 text-xs text-[var(--muted-custom)]">
                        {f.placeholder || "Paragraph response..."}
                      </div>
                    ) : f.type === "select" ? (
                      <div className="rounded border rule bg-[var(--surface)] p-2 font-mono text-xs text-[var(--muted-custom)]">
                        Options: {f.options?.join(" | ") || "Select choice"}
                      </div>
                    ) : f.type === "checkbox" ? (
                      <div className="flex items-center gap-2 text-xs text-[var(--muted-custom)]">
                        <input type="checkbox" disabled className="rounded" />
                        <span>I confirm / agree</span>
                      </div>
                    ) : (
                      <div className="rounded border rule bg-[var(--surface)] p-2 text-xs text-[var(--muted-custom)]">
                        {f.placeholder || `[${f.type} input]`}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewForm(null)}
                className="btn-brass rounded px-5 py-2 text-xs font-semibold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
