import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { getAllEmployeesForPicker, getLeaveRequests } from "@/lib/data";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/ui/panel";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LeaveRequestForm } from "@/components/leave/leave-request-form";
import { LeaveActions } from "@/components/leave/leave-actions";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const TABS = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
] as const;

export default async function LeavePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const status = (params.status ?? "") as "" | "PENDING" | "APPROVED" | "REJECTED";

  const [requests, employees] = await Promise.all([
    getLeaveRequests({ status: status || undefined }),
    getAllEmployeesForPicker(),
  ]);

  return (
    <div>
      <PageHeader
        title="Leave management"
        description="Review, approve, and track time-off requests."
        action={<LeaveRequestForm employees={employees} />}
      />

      <div className="mb-5 flex gap-1 border-b border-line">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value ? `/leave?status=${tab.value}` : "/leave"}
            className={cn(
              "border-b-2 border-transparent px-3 py-2 text-sm font-medium text-ink-soft hover:text-ink",
              status === tab.value && "border-brand text-brand",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {requests.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No leave requests"
          description={
            status
              ? `There are no ${status.toLowerCase()} requests right now.`
              : "Leave requests will show up here once submitted."
          }
        />
      ) : (
        <Panel className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
                  <th className="px-5 py-3 font-medium">Employee</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Dates</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-stone">
                    <td className="px-5 py-3">
                      <Link href={`/employees/${r.employeeId}`} className="flex items-center gap-3">
                        <Avatar name={r.employeeName} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink">{r.employeeName}</p>
                          <p className="truncate text-xs text-ink-soft">{r.jobTitle}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-ink-soft">
                      {r.type.charAt(0) + r.type.slice(1).toLowerCase()}
                    </td>
                    <td className="px-5 py-3 text-ink-soft">
                      {formatDate(r.startDate)} – {formatDate(r.endDate)}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={r.status} kind="leave" />
                    </td>
                    <td className="px-5 py-3">
                      {r.status === "PENDING" ? (
                        <LeaveActions id={r.id} />
                      ) : (
                        <span className="text-xs text-ink-soft">—</span>
                      )}
                    </td>
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
