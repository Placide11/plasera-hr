import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { departments } from "@/db/schema";
import { getDepartmentsWithCounts } from "@/lib/data";

const schema = z.object({
  name: z.string().min(2, "Department name is required."),
  description: z.string().optional(),
});

export async function GET() {
  const rows = await getDepartmentsWithCounts();
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

  const existing = await db
    .select()
    .from(departments)
    .where(eq(departments.name, parsed.data.name));
  if (existing.length > 0) {
    return NextResponse.json(
      { error: { name: ["A department with this name already exists."] } },
      { status: 409 },
    );
  }

  const [created] = await db.insert(departments).values(parsed.data).returning();
  return NextResponse.json(created, { status: 201 });
}
