"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Pencil, Plus, Trash2, X } from "lucide-react";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, inputClass } from "@/components/ui/field";

type Department = {
  id: string;
  name: string;
  description: string | null;
  employeeCount: number;
};

export function DepartmentManager({ departments }: { departments: Department[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function startCreate() {
    setForm({ name: "", description: "" });
    setError(null);
    setCreating(true);
    setEditingId(null);
  }

  function startEdit(dept: Department) {
    setForm({ name: dept.name, description: dept.description ?? "" });
    setError(null);
    setEditingId(dept.id);
    setCreating(false);
  }

  function cancel() {
    setCreating(false);
    setEditingId(null);
    setError(null);
  }

  async function submit(id?: string) {
    setSubmitting(true);
    setError(null);
    const res = await fetch(id ? `/api/departments/${id}` : "/api/departments", {
      method: id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error?.name?.[0] ?? "Something went wrong.");
      return;
    }
    setCreating(false);
    setEditingId(null);
    router.refresh();
  }

  async function remove(id: string) {
    setSubmitting(true);
    setDeleteError(null);
    const res = await fetch(`/api/departments/${id}`, { method: "DELETE" });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json();
      setDeleteError(data.error ?? "Could not delete this department.");
      return;
    }
    setDeletingId(null);
    router.refresh();
  }

  return (
    <div>
      <div className="mb-5 flex justify-end">
        <Button onClick={startCreate}>
          <Plus className="h-4 w-4" />
          Add department
        </Button>
      </div>

      {creating && (
        <Panel className="mb-4 p-5">
          <h3 className="mb-3 font-display text-base font-medium text-ink">New department</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Name" error={error ?? undefined}>
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Customer Success"
              />
            </Field>
            <Field label="Description">
              <input
                className={inputClass}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Optional"
              />
            </Field>
          </div>
          <div className="mt-4 flex gap-3">
            <Button onClick={() => submit()} disabled={submitting || !form.name}>
              {submitting ? "Saving…" : "Create department"}
            </Button>
            <Button variant="secondary" onClick={cancel}>
              Cancel
            </Button>
          </div>
        </Panel>
      )}

      {departments.length === 0 && !creating ? (
        <EmptyState
          icon={Building2}
          title="No departments yet"
          description="Create your first department to start organizing employees."
          action={
            <Button variant="secondary" onClick={startCreate}>
              <Plus className="h-4 w-4" />
              Add department
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept) => (
            <Panel key={dept.id} className="p-5">
              {editingId === dept.id ? (
                <div>
                  <Field label="Name" error={error ?? undefined} className="mb-3">
                    <input
                      className={inputClass}
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    />
                  </Field>
                  <Field label="Description" className="mb-4">
                    <input
                      className={inputClass}
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    />
                  </Field>
                  <div className="flex gap-2">
                    <Button onClick={() => submit(dept.id)} disabled={submitting}>
                      Save
                    </Button>
                    <Button variant="secondary" onClick={cancel}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-base font-medium text-ink">
                        {dept.name}
                      </h3>
                      <p className="mt-1 text-sm text-ink-soft">
                        {dept.employeeCount} {dept.employeeCount === 1 ? "person" : "people"}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEdit(dept)}
                        className="rounded-sm p-1.5 text-ink-soft hover:bg-stone hover:text-ink"
                        aria-label={`Edit ${dept.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setDeletingId(dept.id);
                          setDeleteError(null);
                        }}
                        className="rounded-sm p-1.5 text-ink-soft hover:bg-status-rejected-soft hover:text-status-rejected"
                        aria-label={`Delete ${dept.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {dept.description && (
                    <p className="mt-3 text-sm text-ink-soft">{dept.description}</p>
                  )}
                </div>
              )}
            </Panel>
          ))}
        </div>
      )}

      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
          <div className="w-full max-w-sm rounded-sm border border-line bg-panel p-5">
            <h3 className="font-display text-base font-medium text-ink">Delete department?</h3>
            <p className="mt-2 text-sm text-ink-soft">This can&apos;t be undone.</p>
            {deleteError && (
              <p className="mt-3 rounded-sm border border-status-rejected bg-status-rejected-soft px-3 py-2 text-sm text-status-rejected">
                {deleteError}
              </p>
            )}
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setDeletingId(null)} disabled={submitting}>
                Cancel
              </Button>
              <Button variant="danger" onClick={() => remove(deletingId)} disabled={submitting}>
                {submitting ? "Deleting…" : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
