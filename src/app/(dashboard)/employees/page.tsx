import Link from "next/link";
import { Plus, Search, UserX } from "lucide-react";
import { getAllDepartments, getEmployees } from "@/lib/data";
import { PageHeader } from "@/components/layout/page-header";
import { LinkButton } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { inputClass } from "@/components/ui/field";

export const dynamic = "force-dynamic";

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; departmentId?: string; status?: string }>;
}) {
  const params = await searchParams;
  const [employees, departments] = await Promise.all([
    getEmployees({
      search: params.search,
      departmentId: params.departmentId,
      status: params.status as "ACTIVE" | "ON_LEAVE" | "INACTIVE" | undefined,
    }),
    getAllDepartments(),
  ]);

  const hasFilters = Boolean(params.search || params.departmentId || params.status);

  return (
    <div>
      <PageHeader
        title="Employees"
        description={`${employees.length} ${employees.length === 1 ? "person" : "people"}`}
        action={
          <LinkButton href="/employees/new">
            <Plus className="h-4 w-4" />
            Add employee
          </LinkButton>
        }
      />

      <form className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
          <input
            type="text"
            name="search"
            defaultValue={params.search}
            placeholder="Search by name, email, or title…"
            className={`${inputClass} pl-9`}
          />
        </div>
        <select name="departmentId" defaultValue={params.departmentId ?? ""} className={inputClass + " sm:w-48"}>
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={params.status ?? ""} className={inputClass + " sm:w-40"}>
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="ON_LEAVE">On leave</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <button
          type="submit"
          className="rounded-sm border border-line px-3.5 py-2 text-sm font-medium text-ink hover:border-ink"
        >
          Filter
        </button>
      </form>

      {employees.length === 0 ? (
        <EmptyState
          icon={UserX}
          title={hasFilters ? "No employees match these filters" : "No employees yet"}
          description={
            hasFilters
              ? "Try a different search term or clear the filters."
              : "Add your first employee to start building the team directory."
          }
          action={
            !hasFilters && (
              <LinkButton href="/employees/new" variant="secondary">
                <Plus className="h-4 w-4" />
                Add employee
              </LinkButton>
            )
          }
        />
      ) : (
        <Panel className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Department</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Date joined</th>
                  <th className="px-5 py-3 font-medium">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {employees.map((e) => (
                  <tr key={e.id} className="hover:bg-stone">
                    <td className="px-5 py-3">
                      <Link href={`/employees/${e.id}`} className="flex items-center gap-3">
                        <Avatar name={e.fullName} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink">{e.fullName}</p>
                          <p className="truncate text-xs text-ink-soft">{e.jobTitle}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-ink-soft">{e.departmentName}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={e.employmentStatus} kind="employment" />
                    </td>
                    <td className="px-5 py-3 text-ink-soft">{formatDate(e.dateJoined)}</td>
                    <td className="px-5 py-3 text-ink-soft">{e.location ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
  );
}
