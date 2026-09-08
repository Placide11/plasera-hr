import { getDepartmentsWithCounts } from "@/lib/data";
import { PageHeader } from "@/components/layout/page-header";
import { DepartmentManager } from "@/components/departments/department-manager";

export const dynamic = "force-dynamic";

export default async function DepartmentsPage() {
  const departments = await getDepartmentsWithCounts();

  return (
    <div>
      <PageHeader
        title="Departments"
        description={`${departments.length} ${departments.length === 1 ? "department" : "departments"}`}
      />
      <DepartmentManager departments={departments} />
    </div>
  );
}
