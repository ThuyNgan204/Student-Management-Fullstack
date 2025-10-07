// app/api/lecturers/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const lecturerId = Number(id);

  if (isNaN(lecturerId)) {
    return NextResponse.json({ error: "Invalid lecturer id" }, { status: 400 });
  }

  try {
    const lecturer = await prisma.lecturers.findUnique({
      where: { lecturer_id: lecturerId },
      include: {
        departments: true,
        academic_class: true,
        class_section: true,
      },
    });

    if (!lecturer) {
      return NextResponse.json({ error: "Lecturer not found" }, { status: 404 });
    }

    return NextResponse.json(lecturer);
  } catch (error) {
    console.error("GET lecturer error:", error);
    return NextResponse.json({ error: "Failed to fetch lecturer" }, { status: 500 });
  }
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const lecturerId = Number(id);
  const body = await req.json();

  if (isNaN(lecturerId)) {
    return NextResponse.json({ error: "Invalid lecturer id" }, { status: 400 });
  }

  try {
    const lecturer = await prisma.lecturers.update({
      where: { lecturer_id: lecturerId },
      data: {
        lecturer_code: body.lecturer_code,
        first_name: body.first_name,
        last_name: body.last_name,
        gender: body.gender || null,
        dob: body.dob ? new Date(body.dob) : null,
        phone: body.phone || null,
        email: body.email || null,
        address: body.address || null,
        department_id: body.department_id ? Number(body.department_id) : null,
        avatar: body.avatar || null,
        position: body.position || null,
      },
      include: {
        departments: true,
        academic_class: true,
      },
    });

    return NextResponse.json(lecturer);
  } catch (error) {
    console.error("PUT lecturer error:", error);
    return NextResponse.json({ error: "Failed to update lecturer" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const lecturerId = Number(id);

    if (isNaN(lecturerId)) {
      return NextResponse.json({ error: "Invalid lecturer id" }, { status: 400 });
    }

    // 1. Xóa tất cả user_account liên quan tới lecturer
    await prisma.user_account.deleteMany({
      where: { lecturer_id: lecturerId },
    });

    // 2. Xóa lecturer, Prisma tự động set null các liên kết nhờ onDelete: SetNull
    const deletedLecturer = await prisma.lecturers.delete({
      where: { lecturer_id: lecturerId },
    });

    return NextResponse.json(deletedLecturer);
  } catch (error) {
    console.error("DELETE lecturer error:", error);
    return NextResponse.json({ error: "Failed to delete lecturer" }, { status: 500 });
  }
}
