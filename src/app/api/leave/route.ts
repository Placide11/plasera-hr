import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { activities, employees, leaveRequests } from "@/db/schema";
import { getLeaveRequests } from "@/lib/data";
import { eq } from "drizzle-orm";

const schema = z.object({
  employeeId: z.string().min(1, "Employee is required."),
  type: z.enum(["VACATION", "SICK", "PERSONAL", "UNPAID", "OTHER"]),
  startDate: z.string().min(1, "Start date is required."),
  endDate: z.string().min(1, "End date is required."),
  reason: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | null;
  const rows = await getLeaveRequests({ status: status ?? undefined });
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const { startDate, endDate, ...rest } = parsed.data;

  if (new Date(endDate) < new Date(startDate)) {
    return NextResponse.json(
      { error: { endDate: ["End date can't be before the start date."] } },
      { status: 400 },
    );
  }

  const [employee] = await db
    .select()
    .from(employees)
    .where(eq(employees.id, parsed.data.employeeId));
  if (!employee) {
    return NextResponse.json(
      { error: { employeeId: ["Employee not found."] } },
      { status: 404 },
    );
  }

  const [created] = await db
    .insert(leaveRequests)
    .values({
      ...rest,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    })
    .returning();

  await db.insert(activities).values({
    employeeId: rest.employeeId,
    message: "Submitted a leave request",
  });

  return NextResponse.json(created, { status: 201 });
}
