import { notFound } from "next/navigation";
import { getAllDepartments, getAllEmployeesForPicker, getEmployeeById } from "@/lib/data";
import { PageHeader } from "@/components/layout/page-header";
import { EmployeeForm } from "@/components/employees/employee-form";

export default async function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [result, departments, managers] = await Promise.all([
    getEmployeeById(id),
    getAllDepartments(),
    getAllEmployeesForPicker(),
  ]);

  if (!result) notFound();
  const { employee } = result;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={`Edit ${employee.fullName}`} description="Update this employee's profile." />
      <EmployeeForm
        departments={departments}
        managers={managers}
        initialValues={{
          id: employee.id,
          fullName: employee.fullName,
          email: employee.email,
          phone: employee.phone ?? "",
          jobTitle: employee.jobTitle,
          employmentStatus: employee.employmentStatus,
          dateJoined: new Date(employee.dateJoined).toISOString().slice(0, 10),
          location: employee.location ?? "",
          departmentId: employee.departmentId,
          managerId: employee.managerId ?? "",
        }}
      />
    </div>
  );
}
