// app/api/user_account/available-users/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/user_account/available-users
 * Returns list of students and lecturers who DON'T have an user_account yet.
 * Response: [{ type: 'student'|'lecturer', id, code, first_name, last_name, email, phone }]
 */
export async function GET(req: Request) {
  try {
    // Students without account
    const students = await prisma.students.findMany({
      where: {
        user_account: { none: {} }, // assuming relation name user_account; if relationship named differently adjust
      },
      select: {
        student_id: true,
        student_code: true,
        first_name: true,
        last_name: true,
        email: true,
        phone: true,
      },
    });

    // Lecturers without account
    const lecturers = await prisma.lecturers.findMany({
      where: {
        user_account: { none: {} },
      },
      select: {
        lecturer_id: true,
        lecturer_code: true,
        first_name: true,
        last_name: true,
        email: true,
        phone: true,
      },
    });

    const result = [
      ...students.map((s) => ({
        type: "student",
        id: s.student_id,
        code: s.student_code,
        first_name: s.first_name,
        last_name: s.last_name,
        email: s.email,
        phone: s.phone,
      })),
      ...lecturers.map((l) => ({
        type: "lecturer",
        id: l.lecturer_id,
        code: l.lecturer_code,
        first_name: l.first_name,
        last_name: l.last_name,
        email: l.email,
        phone: l.phone,
      })),
    ];

    return NextResponse.json(result);
  } catch (error) {
    console.error("available-users error:", error);
    return NextResponse.json({ error: "Failed to fetch available users" }, { status: 500 });
  }
}
