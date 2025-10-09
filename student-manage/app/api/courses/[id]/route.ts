import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 🔹 GET /api/courses/:id
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const course = await prisma.courses.findUnique({
    where: { course_id: Number(params.id) },
    include: { departments: true },
  });

  if (!course) {
    return NextResponse.json({ error: "Không tìm thấy môn học." }, { status: 404 });
  }

  return NextResponse.json(course);
}

// 🔹 PUT /api/courses/:id
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { course_code, course_name, credits, department_id } = body;

    const updated = await prisma.courses.update({
      where: { course_id: Number(params.id) },
      data: { course_code, course_name, credits, department_id },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/courses/:id error:", error);
    return NextResponse.json({ error: "Không thể cập nhật môn học." }, { status: 500 });
  }
}

// 🔹 DELETE /api/courses/:id
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.courses.delete({ where: { course_id: Number(params.id) } });
    return NextResponse.json({ message: "Đã xóa môn học thành công." });
  } catch (error) {
    console.error("DELETE /api/courses/:id error:", error);
    return NextResponse.json({ error: "Không thể xóa môn học." }, { status: 500 });
  }
}
