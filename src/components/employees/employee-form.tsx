"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field, inputClass } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";

type Department = { id: string; name: string };
type ManagerOption = { id: string; fullName: string };

type EmployeeFormValues = {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  jobTitle: string;
  employmentStatus: "ACTIVE" | "ON_LEAVE" | "INACTIVE";
  dateJoined: string;
  location: string;
  departmentId: string;
  managerId: string;
};

export function EmployeeForm({
  departments,
  managers,
  initialValues,
}: {
  departments: Department[];
  managers: ManagerOption[];
  initialValues?: EmployeeFormValues;
}) {
  const router = useRouter();
  const isEdit = Boolean(initialValues?.id);
  const [values, setValues] = useState<EmployeeFormValues>(
    initialValues ?? {
      fullName: "",
      email: "",
      phone: "",
      jobTitle: "",
      employmentStatus: "ACTIVE",
      dateJoined: new Date().toISOString().slice(0, 10),
      location: "",
      departmentId: departments[0]?.id ?? "",
      managerId: "",
    },
  );
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function update<K extends keyof EmployeeFormValues>(key: K, value: EmployeeFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setFormError(null);

    const payload = { ...values, managerId: values.managerId || null };
    const url = isEdit ? `/api/employees/${initialValues!.id}` : "/api/employees";
    const method = isEdit ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        if (typeof data.error === "string") setFormError(data.error);
        else setErrors(data.error ?? {});
        setSubmitting(false);
        return;
      }

      router.push(`/employees/${data.id}`);
      router.refresh();
    } catch {
      setFormError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <div className="rounded-sm border border-status-rejected bg-status-rejected-soft px-4 py-3 text-sm text-status-rejected">
          {formError}
        </div>
      )}

      <Panel className="p-5">
        <h2 className="mb-4 font-display text-base font-medium text-ink">
          Personal information
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full name" error={errors.fullName?.[0]}>
            <input
              className={inputClass}
              value={values.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              placeholder="e.g. Amara Uwase"
              required
            />
          </Field>
          <Field label="Email" error={errors.email?.[0]}>
            <input
              type="email"
              className={inputClass}
              value={values.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="name@plasera.dev"
              required
            />
          </Field>
          <Field label="Phone" error={errors.phone?.[0]}>
            <input
              className={inputClass}
              value={values.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+250 788 000 000"
            />
          </Field>
          <Field label="Location" error={errors.location?.[0]}>
            <input
              className={inputClass}
              value={values.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="e.g. Kigali, Rwanda"
            />
          </Field>
        </div>
      </Panel>

      <Panel className="p-5">
        <h2 className="mb-4 font-display text-base font-medium text-ink">
          Employment information
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Job title" error={errors.jobTitle?.[0]}>
            <input
              className={inputClass}
              value={values.jobTitle}
              onChange={(e) => update("jobTitle", e.target.value)}
              placeholder="e.g. Product Designer"
              required
            />
          </Field>
          <Field label="Department" error={errors.departmentId?.[0]}>
            <select
              className={inputClass}
              value={values.departmentId}
              onChange={(e) => update("departmentId", e.target.value)}
              required
            >
              {departments.length === 0 && <option value="">No departments yet</option>}
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Employment status" error={errors.employmentStatus?.[0]}>
            <select
              className={inputClass}
              value={values.employmentStatus}
              onChange={(e) =>
                update("employmentStatus", e.target.value as EmployeeFormValues["employmentStatus"])
              }
            >
              <option value="ACTIVE">Active</option>
              <option value="ON_LEAVE">On leave</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </Field>
          <Field label="Date joined" error={errors.dateJoined?.[0]}>
            <input
              type="date"
              className={inputClass}
              value={values.dateJoined?.slice(0, 10)}
              onChange={(e) => update("dateJoined", e.target.value)}
              required
            />
          </Field>
          <Field label="Manager" error={errors.managerId?.[0]} className="sm:col-span-2">
            <select
              className={inputClass}
              value={values.managerId}
              onChange={(e) => update("managerId", e.target.value)}
            >
              <option value="">No manager</option>
              {managers
                .filter((m) => m.id !== initialValues?.id)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName}
                  </option>
                ))}
            </select>
          </Field>
        </div>
      </Panel>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : isEdit ? "Save changes" : "Add employee"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
