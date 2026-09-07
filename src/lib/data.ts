import { and, desc, eq, like, or } from "drizzle-orm";
import { db } from "@/db";
import {
  activities,
  departments,
  employees,
  leaveRequests,
} from "@/db/schema";

export type EmploymentStatus = "ACTIVE" | "ON_LEAVE" | "INACTIVE";
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

export async function getDashboardStats() {
  const allEmployees = await db.select().from(employees);
  const allDepartments = await db.select().from(departments);
  const pendingLeave = await db
    .select()
    .from(leaveRequests)
    .where(eq(leaveRequests.status, "PENDING"));

  const recentActivity = await db
    .select({
      id: activities.id,
      message: activities.message,
      createdAt: activities.createdAt,
      employeeName: employees.fullName,
      employeeId: employees.id,
    })
    .from(activities)
    .innerJoin(employees, eq(activities.employeeId, employees.id))
    .orderBy(desc(activities.createdAt))
    .limit(6);

  const byDepartment = allDepartments.map((dept) => ({
    id: dept.id,
    name: dept.name,
    count: allEmployees.filter((e) => e.departmentId === dept.id).length,
  }));

  return {
    total: allEmployees.length,
    active: allEmployees.filter((e) => e.employmentStatus === "ACTIVE").length,
    onLeave: allEmployees.filter((e) => e.employmentStatus === "ON_LEAVE")
      .length,
    inactive: allEmployees.filter((e) => e.employmentStatus === "INACTIVE")
      .length,
    departmentCount: allDepartments.length,
    pendingLeaveCount: pendingLeave.length,
    byDepartment,
    recentActivity,
  };
}

export async function getEmployees(params: {
  search?: string;
  departmentId?: string;
  status?: EmploymentStatus;
}) {
  const conditions = [];
  if (params.search) {
    conditions.push(
      or(
        like(employees.fullName, `%${params.search}%`),
        like(employees.email, `%${params.search}%`),
        like(employees.jobTitle, `%${params.search}%`),
      ),
    );
  }
  if (params.departmentId) {
    conditions.push(eq(employees.departmentId, params.departmentId));
  }
  if (params.status) {
    conditions.push(eq(employees.employmentStatus, params.status));
  }

  const rows = await db
    .select({
      id: employees.id,
      fullName: employees.fullName,
      email: employees.email,
      jobTitle: employees.jobTitle,
      employmentStatus: employees.employmentStatus,
      dateJoined: employees.dateJoined,
      location: employees.location,
      departmentId: employees.departmentId,
      departmentName: departments.name,
    })
    .from(employees)
    .innerJoin(departments, eq(employees.departmentId, departments.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(employees.fullName);

  return rows;
}

export async function getEmployeeById(id: string) {
  const employee = await db.query.employees.findFirst({
    where: eq(employees.id, id),
  });
  if (!employee) return null;

  const department = await db.query.departments.findFirst({
    where: eq(departments.id, employee.departmentId),
  });

  const manager = employee.managerId
    ? await db.query.employees.findFirst({
        where: eq(employees.id, employee.managerId),
      })
    : null;

  const reports = await db
    .select()
    .from(employees)
    .where(eq(employees.managerId, id));

  const leave = await db
    .select()
    .from(leaveRequests)
    .where(eq(leaveRequests.employeeId, id))
    .orderBy(desc(leaveRequests.createdAt));

  const employeeActivities = await db
    .select()
    .from(activities)
    .where(eq(activities.employeeId, id))
    .orderBy(desc(activities.createdAt))
    .limit(10);

  return { employee, department, manager, reports, leave, activities: employeeActivities };
}

export async function getDepartmentsWithCounts() {
  const allDepartments = await db.select().from(departments);
  const allEmployees = await db.select().from(employees);
  return allDepartments.map((dept) => ({
    ...dept,
    employeeCount: allEmployees.filter((e) => e.departmentId === dept.id)
      .length,
  }));
}

export async function getAllDepartments() {
  return db.select().from(departments).orderBy(departments.name);
}

export async function getAllEmployeesForPicker() {
  return db
    .select({ id: employees.id, fullName: employees.fullName })
    .from(employees)
    .orderBy(employees.fullName);
}

export async function getLeaveRequests(params: { status?: LeaveStatus }) {
  const rows = await db
    .select({
      id: leaveRequests.id,
      type: leaveRequests.type,
      startDate: leaveRequests.startDate,
      endDate: leaveRequests.endDate,
      reason: leaveRequests.reason,
      status: leaveRequests.status,
      createdAt: leaveRequests.createdAt,
      employeeId: employees.id,
      employeeName: employees.fullName,
      jobTitle: employees.jobTitle,
    })
    .from(leaveRequests)
    .innerJoin(employees, eq(leaveRequests.employeeId, employees.id))
    .where(params.status ? eq(leaveRequests.status, params.status) : undefined)
    .orderBy(desc(leaveRequests.createdAt));
  return rows;
}
