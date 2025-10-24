import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* ------------------------------------------------------
   📌 GET: Lấy danh sách học phần thuộc 1 ngành
   ------------------------------------------------------ */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const majorId = Number(searchParams.get("major_id"));

    if (!majorId) {
      return NextResponse.json(
        { error: "Thiếu major_id để lấy danh sách học phần" },
        { status: 400 }
      );
    }

    const courses = await prisma.major_courses.findMany({
      where: { major_id: majorId },
      include: {
        courses: {
          select: {
            course_id: true,
            course_code: true,
            course_name: true,
            credits: true,
            departments: {
              select: {
                department_name: true,
              },
            },
          },
        },
      },
      orderBy: { semester: "asc" },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("❌ GET /major_courses error:", error);
    return NextResponse.json(
      { error: "Lỗi khi lấy danh sách học phần của ngành", details: String(error) },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------
   📌 POST: Thêm học phần vào ngành
   ------------------------------------------------------ */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { major_id, course_id, semester, year, is_required } = body;

    if (!major_id || !course_id) {
      return NextResponse.json(
        { error: "Thiếu major_id hoặc course_id" },
        { status: 400 }
      );
    }

    // 🔍 Kiểm tra trùng lặp
    const existing = await prisma.major_courses.findUnique({
      where: {
        major_id_course_id: {
          major_id: Number(major_id),
          course_id: Number(course_id),
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Học phần này đã tồn tại trong ngành." },
        { status: 400 }
      );
    }

    // ✅ Tạo mới
    const newEntry = await prisma.major_courses.create({
      data: {
        major_id: Number(major_id),
        course_id: Number(course_id),
        semester: semester ? Number(semester) : null,
        year: year ? Number(year) : null,
        is_required: is_required ?? true,
      },
      include: {
        courses: {
          select: { course_id: true, course_code: true, course_name: true, credits: true },
        },
      },
    });

    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error("❌ POST /major_courses error:", error);
    return NextResponse.json(
      { error: "Lỗi khi thêm học phần vào ngành", details: String(error) },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------
   📌 DELETE: Xóa học phần khỏi ngành
   ------------------------------------------------------ */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const majorId = Number(searchParams.get("major_id"));
    const courseId = Number(searchParams.get("course_id"));

    if (!majorId || !courseId) {
      return NextResponse.json(
        { error: "Thiếu major_id hoặc course_id để xóa" },
        { status: 400 }
      );
    }

    await prisma.major_courses.delete({
      where: {
        major_id_course_id: {
          major_id: majorId,
          course_id: courseId,
        },
      },
    });

    return NextResponse.json({ message: "Đã xóa học phần khỏi ngành thành công" });
  } catch (error) {
    console.error("❌ DELETE /major_courses error:", error);
    return NextResponse.json(
      { error: "Lỗi khi xóa học phần khỏi ngành", details: String(error) },
      { status: 500 }
    );
  }
}
