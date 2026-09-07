import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { activities, employees } from "@/db/schema";
import { getEmployees } from "@/lib/data";

const employeeSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  email: z.string().email("Enter a valid email."),
  phone: z.string().optional(),
  jobTitle: z.string().min(2, "Job title is required."),
  employmentStatus: z.enum(["ACTIVE", "ON_LEAVE", "INACTIVE"]),
  dateJoined: z.string().min(1, "Date joined is required."),
  location: z.string().optional(),
  departmentId: z.string().min(1, "Department is required."),
  managerId: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rows = await getEmployees({
    search: searchParams.get("search") ?? undefined,
    departmentId: searchParams.get("departmentId") ?? undefined,
    status: (searchParams.get("status") as "ACTIVE" | "ON_LEAVE" | "INACTIVE" | null) ?? undefined,
  });
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = employeeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;

  const existing = await db
    .select()
    .from(employees)
    .where(eq(employees.email, data.email));
  if (existing.length > 0) {
    return NextResponse.json(
      { error: { email: ["An employee with this email already exists."] } },
      { status: 409 },
    );
  }

  const [created] = await db
    .insert(employees)
    .values({
      ...data,
      managerId: data.managerId || null,
      dateJoined: new Date(data.dateJoined),
    })
    .returning();

  await db.insert(activities).values({
    employeeId: created.id,
    message: "Joined the company",
  });

  return NextResponse.json(created, { status: 201 });
}
