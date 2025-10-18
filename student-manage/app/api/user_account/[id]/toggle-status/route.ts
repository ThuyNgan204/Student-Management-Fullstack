// app/api/user_account/[id]/toggle-status/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const userId = Number(id);

  if (isNaN(userId)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  try {
    const existing = await prisma.user_account.findUnique({ where: { user_id: userId } });
    if (!existing) {
      return NextResponse.json({ error: "User account not found" }, { status: 404 });
    }

    const updated = await prisma.user_account.update({
      where: { user_id: userId },
      data: { is_active: !existing.is_active },
      include: { students: true, lecturers: true },
    });

    return NextResponse.json({ message: "Toggled status", account: updated });
  } catch (error) {
    console.error("Toggle status error:", error);
    return NextResponse.json({ error: "Failed to toggle status" }, { status: 500 });
  }
}
