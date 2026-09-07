import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, Phone, MapPin, Calendar, Pencil, Activity } from "lucide-react";
import { getEmployeeById } from "@/lib/data";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/ui/panel";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { DeleteEmployeeButton } from "@/components/employees/delete-employee-button";
import { formatDate } from "@/lib/utils";

export default async function EmployeeProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getEmployeeById(id);
  if (!result) notFound();

  const { employee, department, manager, reports, leave, activities } = result;

  return (
    <div>
      <PageHeader
        title={employee.fullName}
        description={employee.jobTitle}
        action={
          <div className="flex gap-3">
            <LinkButton href={`/employees/${employee.id}/edit`} variant="secondary">
              <Pencil className="h-4 w-4" />
              Edit
            </LinkButton>
            <DeleteEmployeeButton
              employeeId={employee.id}
              employeeName={employee.fullName}
              redirectTo="/employees"
            />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <Panel className="p-5">
            <div className="flex items-center gap-4">
              <Avatar name={employee.fullName} size="lg" />
              <div>
                <p className="font-display text-lg font-medium text-ink">
                  {employee.fullName}
                </p>
                <p className="text-sm text-ink-soft">{employee.jobTitle}</p>
                <div className="mt-2">
                  <StatusBadge status={employee.employmentStatus} kind="employment" />
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-3 border-t border-line pt-5 text-sm">
              <div className="flex items-center gap-2.5 text-ink-soft">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate text-ink">{employee.email}</span>
              </div>
              {employee.phone && (
                <div className="flex items-center gap-2.5 text-ink-soft">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span className="text-ink">{employee.phone}</span>
                </div>
              )}
              {employee.location && (
                <div className="flex items-center gap-2.5 text-ink-soft">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="text-ink">{employee.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2.5 text-ink-soft">
                <Calendar className="h-4 w-4 shrink-0" />
                <span className="text-ink">Joined {formatDate(employee.dateJoined)}</span>
              </div>
            </div>
          </Panel>

          <Panel className="p-5">
            <h2 className="mb-3 font-display text-base font-medium text-ink">
              Employment
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Department</dt>
                <dd className="font-medium text-ink">
                  {department ? (
                    <Link href="/departments" className="hover:underline">
                      {department.name}
                    </Link>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Manager</dt>
                <dd className="font-medium text-ink">
                  {manager ? (
                    <Link href={`/employees/${manager.id}`} className="hover:underline">
                      {manager.fullName}
                    </Link>
                  ) : (
                    "No manager"
                  )}
                </dd>
              </div>
            </dl>

            {reports.length > 0 && (
              <div className="mt-4 border-t border-line pt-4">
                <p className="mb-2 text-sm text-ink-soft">Direct reports</p>
                <div className="space-y-1">
                  {reports.map((r) => (
                    <Link
                      key={r.id}
                      href={`/employees/${r.id}`}
                      className="block text-sm text-ink hover:underline"
                    >
                      {r.fullName}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </Panel>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Panel>
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="font-display text-base font-medium text-ink">
                Leave history
              </h2>
              <Link href="/leave" className="text-sm text-brand hover:underline">
                Go to leave management
              </Link>
            </div>
            {leave.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-ink-soft">
                No leave requests on file.
              </p>
            ) : (
              <div className="divide-y divide-line">
                {leave.map((l) => (
                  <div key={l.id} className="flex items-center justify-between px-5 py-3.5">
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {l.type.charAt(0) + l.type.slice(1).toLowerCase()}
                      </p>
                      <p className="text-xs text-ink-soft">
                        {formatDate(l.startDate)} – {formatDate(l.endDate)}
                      </p>
                    </div>
                    <StatusBadge status={l.status} kind="leave" />
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel>
            <div className="border-b border-line px-5 py-4">
              <h2 className="font-display text-base font-medium text-ink">
                Recent activity
              </h2>
            </div>
            {activities.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
                <Activity className="h-6 w-6 text-ink-soft" strokeWidth={1.5} />
                <p className="text-sm text-ink-soft">No activity recorded yet.</p>
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {activities.map((a) => (
                  <li key={a.id} className="flex items-center justify-between px-5 py-3">
                    <span className="text-sm text-ink">{a.message}</span>
                    <span className="text-xs text-ink-soft">{formatDate(a.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
