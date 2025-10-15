import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const userId = Number(id);

  try {
    const user = await prisma.user_account.findUnique({
      where: { user_id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updated = await prisma.user_account.update({
      where: { user_id: userId },
      data: { is_active: !user.is_active },
    });

    return NextResponse.json({
      message: `User ${updated.is_active ? "activated" : "deactivated"} successfully`,
      user: updated,
    });
  } catch (error) {
    console.error("Toggle status error:", error);
    return NextResponse.json({ error: "Failed to toggle status" }, { status: 500 });
  }
}
