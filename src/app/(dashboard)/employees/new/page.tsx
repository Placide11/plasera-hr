import { getAllDepartments, getAllEmployeesForPicker } from "@/lib/data";
import { PageHeader } from "@/components/layout/page-header";
import { EmployeeForm } from "@/components/employees/employee-form";

export default async function NewEmployeePage() {
  const [departments, managers] = await Promise.all([
    getAllDepartments(),
    getAllEmployeesForPicker(),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Add employee" description="Create a new employee profile." />
      <EmployeeForm departments={departments} managers={managers} />
    </div>
  );
}
