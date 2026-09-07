import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { activities, leaveRequests } from "@/db/schema";

const schema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
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
    .update(leaveRequests)
    .set({
      status: parsed.data.status,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(leaveRequests.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.insert(activities).values({
    employeeId: updated.employeeId,
    message: `Leave request ${parsed.data.status.toLowerCase()}`,
  });

  return NextResponse.json(updated);
}
