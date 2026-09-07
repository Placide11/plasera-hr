import Link from "next/link";
import { Activity } from "lucide-react";
import { getDashboardStats } from "@/lib/data";
import { PageHeader } from "@/components/layout/page-header";
import { StatPanel, Panel } from "@/components/ui/panel";
import { Avatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="An overview of Plasera's people and org health."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatPanel label="Total employees" value={stats.total} accent="brand" />
        <StatPanel label="Active" value={stats.active} accent="active" />
        <StatPanel label="On leave" value={stats.onLeave} accent="leave" />
        <StatPanel label="Departments" value={stats.departmentCount} accent="inactive" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-display text-base font-medium text-ink">
              Employees by department
            </h2>
            <Link
              href="/departments"
              className="text-sm text-brand hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="p-5">
            {stats.byDepartment.length === 0 ? (
              <p className="text-sm text-ink-soft">No departments yet.</p>
            ) : (
              <div className="space-y-4">
                {stats.byDepartment.map((dept) => {
                  const pct = stats.total
                    ? Math.round((dept.count / stats.total) * 100)
                    : 0;
                  return (
                    <div key={dept.id}>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="font-medium text-ink">{dept.name}</span>
                        <span className="text-ink-soft">{dept.count} people</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-stone">
                        <div
                          className="h-1.5 rounded-full bg-brand"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Panel>

        <Panel>
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-display text-base font-medium text-ink">
              Recent activity
            </h2>
          </div>
          <div className="divide-y divide-line">
            {stats.recentActivity.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
                <Activity className="h-6 w-6 text-ink-soft" strokeWidth={1.5} />
                <p className="text-sm text-ink-soft">No activity yet.</p>
              </div>
            ) : (
              stats.recentActivity.map((item) => (
                <Link
                  key={item.id}
                  href={`/employees/${item.employeeId}`}
                  className="flex items-start gap-3 px-5 py-3.5 hover:bg-stone"
                >
                  <Avatar name={item.employeeName} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm text-ink">
                      <span className="font-medium">{item.employeeName}</span>{" "}
                      {item.message.toLowerCase()}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-soft">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </Panel>
      </div>

      {stats.pendingLeaveCount > 0 && (
        <div className="mt-6">
          <Panel className="flex items-center justify-between border-l-2 !border-l-status-leave px-5 py-4">
            <p className="text-sm text-ink">
              <span className="font-medium">{stats.pendingLeaveCount}</span>{" "}
              leave request{stats.pendingLeaveCount === 1 ? "" : "s"} waiting
              for review.
            </p>
            <Link
              href="/leave"
              className="text-sm font-medium text-brand hover:underline"
            >
              Review requests
            </Link>
          </Panel>
        </div>
      )}
    </div>
  );
}
