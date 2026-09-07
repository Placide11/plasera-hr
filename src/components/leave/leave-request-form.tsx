"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { Field, inputClass } from "@/components/ui/field";

type EmployeeOption = { id: string; fullName: string };

export function LeaveRequestForm({ employees }: { employees: EmployeeOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [form, setForm] = useState({
    employeeId: employees[0]?.id ?? "",
    type: "VACATION",
    startDate: "",
    endDate: "",
    reason: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    const res = await fetch("/api/leave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setErrors(data.error ?? {});
      return;
    }
    setOpen(false);
    setForm({ employeeId: employees[0]?.id ?? "", type: "VACATION", startDate: "", endDate: "", reason: "" });
    router.refresh();
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        New leave request
      </Button>
    );
  }

  return (
    <Panel className="mb-6 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-base font-medium text-ink">New leave request</h3>
        <button onClick={() => setOpen(false)} className="text-ink-soft hover:text-ink" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      </div>
      <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Employee" error={errors.employeeId?.[0]}>
          <select
            className={inputClass}
            value={form.employeeId}
            onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
          >
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.fullName}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Type" error={errors.type?.[0]}>
          <select
            className={inputClass}
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
          >
            <option value="VACATION">Vacation</option>
            <option value="SICK">Sick</option>
            <option value="PERSONAL">Personal</option>
            <option value="UNPAID">Unpaid</option>
            <option value="OTHER">Other</option>
          </select>
        </Field>
        <Field label="Start date" error={errors.startDate?.[0]}>
          <input
            type="date"
            className={inputClass}
            value={form.startDate}
            onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            required
          />
        </Field>
        <Field label="End date" error={errors.endDate?.[0]}>
          <input
            type="date"
            className={inputClass}
            value={form.endDate}
            onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
            required
          />
        </Field>
        <Field label="Reason" className="sm:col-span-2">
          <input
            className={inputClass}
            value={form.reason}
            onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
            placeholder="Optional"
          />
        </Field>
        <div className="flex gap-3 sm:col-span-2">
          <Button type="submit" disabled={submitting || employees.length === 0}>
            {submitting ? "Submitting…" : "Submit request"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </form>
    </Panel>
  );
}
