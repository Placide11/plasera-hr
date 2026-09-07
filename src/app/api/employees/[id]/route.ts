import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { activities, employees, leaveRequests } from "@/db/schema";

const updateSchema = z.object({
  fullName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional().nullable(),
  jobTitle: z.string().min(2).optional(),
  employmentStatus: z.enum(["ACTIVE", "ON_LEAVE", "INACTIVE"]).optional(),
  dateJoined: z.string().optional(),
  location: z.string().optional().nullable(),
  departmentId: z.string().optional(),
  managerId: z.string().optional().nullable(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const [employee] = await db.select().from(employees).where(eq(employees.id, id));
  if (!employee) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(employee);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { dateJoined, ...rest } = parsed.data;
  const [before] = await db.select().from(employees).where(eq(employees.id, id));
  if (!before) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [updated] = await db
    .update(employees)
    .set({
      ...rest,
      ...(dateJoined ? { dateJoined: new Date(dateJoined) } : {}),
      updatedAt: new Date(),
    })
    .where(eq(employees.id, id))
    .returning();

  if (rest.employmentStatus && rest.employmentStatus !== before.employmentStatus) {
    await db.insert(activities).values({
      employeeId: id,
      message: `Changed status to ${rest.employmentStatus.replace("_", " ").toLowerCase()}`,
    });
  } else {
    await db.insert(activities).values({
      employeeId: id,
      message: "Updated profile information",
    });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Employees who report to this person keep their history but lose the link.
  await db.update(employees).set({ managerId: null }).where(eq(employees.managerId, id));
  await db.delete(leaveRequests).where(eq(leaveRequests.employeeId, id));
  await db.delete(activities).where(eq(activities.employeeId, id));
  const deleted = await db.delete(employees).where(eq(employees.id, id)).returning();

  if (deleted.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
