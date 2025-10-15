// /api/user_account/[id]/reset-password/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const userId = Number(id);

  try {
    const user = await prisma.user_account.findUnique({
      where: { user_id: userId },
      include: {
        students: true,
        lecturers: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let defaultPassword = "admin123";
    if (user.role === "student" && user.students) {
      defaultPassword = user.students.student_code;
    } else if (user.role === "lecturer" && user.lecturers) {
      defaultPassword = user.lecturers.lecturer_code;
    }

    const hashed = await bcrypt.hash(defaultPassword, 10);

    await prisma.user_account.update({
      where: { user_id: userId },
      data: { password: hashed },
    });

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
