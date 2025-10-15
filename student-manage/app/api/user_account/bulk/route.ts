import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { ids, action } = await req.json();

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "No user IDs provided" }, { status: 400 });
  }

  try {
    switch (action) {
      case "activate":
        await prisma.user_account.updateMany({
          where: { user_id: { in: ids } },
          data: { is_active: true },
        });
        break;

      case "deactivate":
        await prisma.user_account.updateMany({
          where: { user_id: { in: ids } },
          data: { is_active: false },
        });
        break;

      case "delete":
        await prisma.user_account.deleteMany({
          where: { user_id: { in: ids } },
        });
        break;

      case "reset-password":
        const users = await prisma.user_account.findMany({
          where: { user_id: { in: ids } },
          include: { students: true, lecturers: true },
        });

        for (const user of users) {
          let defaultPassword = "admin123";
          if (user.role === "student" && user.students) {
            defaultPassword = user.students.student_code;
          } else if (user.role === "lecturer" && user.lecturers) {
            defaultPassword = user.lecturers.lecturer_code;
          }

          const hashed = await bcrypt.hash(defaultPassword, 10);
          await prisma.user_account.update({
            where: { user_id: user.user_id },
            data: { password: hashed },
          });
        }
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ message: `Bulk ${action} successful` });
  } catch (error) {
    console.error("Bulk action error:", error);
    return NextResponse.json({ error: "Bulk action failed" }, { status: 500 });
  }
}
