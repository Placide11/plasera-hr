import { randomBytes, scryptSync } from "crypto";
import { db } from "./index";
import { activities, departments, employees, leaveRequests, users } from "./schema";

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  await db.delete(activities);
  await db.delete(leaveRequests);
  await db.delete(employees);
  await db.delete(departments);
  await db.delete(users);

  await db.insert(users).values({
    name: "Admin User",
    email: "admin@plasera.dev",
    password: hashPassword("admin123"),
    role: "ADMIN",
  });

  const deptRows = await db
    .insert(departments)
    .values([
      { name: "Engineering", description: "Builds and maintains our products." },
      { name: "Design", description: "Shapes product experience and brand." },
      { name: "Sales", description: "Grows revenue and customer relationships." },
      { name: "People Ops", description: "Hiring, culture, and employee support." },
    ])
    .returning();

  const [engineering, design, sales, people] = deptRows;

  const [amara] = await db
    .insert(employees)
    .values({
      fullName: "Amara Uwase",
      email: "amara.uwase@plasera.dev",
      phone: "+250 788 100 200",
      jobTitle: "VP of Engineering",
      employmentStatus: "ACTIVE",
      dateJoined: new Date("2021-03-01"),
      location: "Kigali, Rwanda",
      departmentId: engineering.id,
    })
    .returning();

  const employeeRows = await db
    .insert(employees)
    .values([
      {
        fullName: "Jean Baptiste Niyonzima",
        email: "jb.niyonzima@plasera.dev",
        phone: "+250 788 100 201",
        jobTitle: "Senior Backend Engineer",
        employmentStatus: "ACTIVE",
        dateJoined: new Date("2022-06-15"),
        location: "Kigali, Rwanda",
        departmentId: engineering.id,
        managerId: amara.id,
      },
      {
        fullName: "Grace Mukamana",
        email: "grace.mukamana@plasera.dev",
        phone: "+250 788 100 202",
        jobTitle: "Frontend Engineer",
        employmentStatus: "ON_LEAVE",
        dateJoined: new Date("2023-01-10"),
        location: "Remote",
        departmentId: engineering.id,
        managerId: amara.id,
      },
      {
        fullName: "Kevin Mugisha",
        email: "kevin.mugisha@plasera.dev",
        phone: "+250 788 100 203",
        jobTitle: "Product Designer",
        employmentStatus: "ACTIVE",
        dateJoined: new Date("2022-11-20"),
        location: "Kigali, Rwanda",
        departmentId: design.id,
      },
      {
        fullName: "Diane Ingabire",
        email: "diane.ingabire@plasera.dev",
        phone: "+250 788 100 204",
        jobTitle: "Account Executive",
        employmentStatus: "ACTIVE",
        dateJoined: new Date("2023-05-02"),
        location: "Kigali, Rwanda",
        departmentId: sales.id,
      },
      {
        fullName: "Eric Habimana",
        email: "eric.habimana@plasera.dev",
        phone: "+250 788 100 205",
        jobTitle: "HR Generalist",
        employmentStatus: "ACTIVE",
        dateJoined: new Date("2024-02-19"),
        location: "Kigali, Rwanda",
        departmentId: people.id,
      },
      {
        fullName: "Chantal Uwimana",
        email: "chantal.uwimana@plasera.dev",
        phone: "+250 788 100 206",
        jobTitle: "Sales Development Rep",
        employmentStatus: "INACTIVE",
        dateJoined: new Date("2022-09-08"),
        location: "Kigali, Rwanda",
        departmentId: sales.id,
      },
    ])
    .returning();

  const [jb, grace, kevin, diane, eric] = employeeRows;

  await db.insert(leaveRequests).values([
    {
      employeeId: grace.id,
      type: "SICK",
      startDate: new Date("2026-08-25"),
      endDate: new Date("2026-09-05"),
      reason: "Recovering from surgery.",
      status: "APPROVED",
      reviewedAt: new Date("2026-08-20"),
    },
    {
      employeeId: jb.id,
      type: "VACATION",
      startDate: new Date("2026-09-15"),
      endDate: new Date("2026-09-22"),
      reason: "Family trip.",
      status: "PENDING",
    },
    {
      employeeId: diane.id,
      type: "PERSONAL",
      startDate: new Date("2026-09-10"),
      endDate: new Date("2026-09-11"),
      reason: "Moving apartments.",
      status: "PENDING",
    },
    {
      employeeId: eric.id,
      type: "UNPAID",
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-07-03"),
      reason: "Personal matters.",
      status: "REJECTED",
      reviewedAt: new Date("2026-06-25"),
    },
  ]);

  const activityLog = [amara, jb, grace, kevin, diane].map((e, i) => ({
    employeeId: e.id,
    message: [
      "Joined the company",
      "Updated profile information",
      "Completed onboarding checklist",
      "Changed job title",
      "Submitted a leave request",
    ][i % 5],
    createdAt: new Date(Date.now() - i * 1000 * 60 * 60 * 24),
  }));

  await db.insert(activities).values(activityLog);

  console.log("Seed complete.");
}

main();