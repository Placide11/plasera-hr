import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { departments, employees } from "@/db/schema";

const schema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const [updated] = await db
    .update(departments)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(departments.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const linked = await db
    .select()
    .from(employees)
    .where(eq(employees.departmentId, id));

  if (linked.length > 0) {
    return NextResponse.json(
      {
        error: `Cannot delete: ${linked.length} employee(s) are still assigned to this department.`,
      },
      { status: 409 },
    );
  }

  const deleted = await db.delete(departments).where(eq(departments.id, id)).returning();
  if (deleted.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
