import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ================= GET ONE =================
// GET /api/students/:id
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> } // 👈 params là Promise
) {
  const { id } = await context.params; // ✅ cần await
  const studentId = Number(id);

  if (isNaN(studentId)) {
    return NextResponse.json({ error: "Invalid student id" }, { status: 400 });
  }

  try {
    const student = await prisma.students.findUnique({
      where: { student_id: studentId },
      include: {
        academic_class: {
          include: {
            lecturers: true,
            majors: true,
          },
        },
        majors: {
          include: {
            departments: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error("GET student error:", error);
    return NextResponse.json({ error: "Failed to fetch student" }, { status: 500 });
  }
}

// ================= UPDATE =================
// PUT /api/students/:id
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✅
  const studentId = Number(id);
  const body = await req.json();

  if (isNaN(studentId)) {
    return NextResponse.json({ error: "Invalid student id" }, { status: 400 });
  }

  try {
    const student = await prisma.students.update({
      where: { student_id: studentId },
      data: {
        first_name: body.first_name,
        last_name: body.last_name,
        student_code: body.student_code,
        gender: body.gender,
        dob: body.dob ? new Date(body.dob) : null,
        address: body.address,
        phone: body.phone,
        email: body.email,
        avatar: body.avatar || null,
        cohort: body.cohort,
        status: body.status,
        academic_class_id: body.academic_class_id,
        major_id: body.major_id,
      },
      include: {
        academic_class: {
          include: {
            lecturers: true,
            majors: true,
          },
        },
        majors: {
          include: {
            departments: true,
          },
        },
      },
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error("UPDATE student error:", error);
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
  }
}

// ================= DELETE =================
// DELETE /api/students/:id
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅
    const studentId = Number(id);

    if (isNaN(studentId)) {
      return NextResponse.json({ error: "Invalid student id" }, { status: 400 });
    }

    // Xóa account trước (foreign key constraint)
    await prisma.user_account.deleteMany({
      where: { student_id: studentId },
    });

    // Sau đó xóa student
    const deleted = await prisma.students.delete({
      where: { student_id: studentId },
    });

    return NextResponse.json({ message: "Student & account deleted", deleted });
  } catch (error: any) {
    console.error("DELETE student error:", error);
    return NextResponse.json(
      { error: error.message ?? "Failed to delete student" },
      { status: 500 }
    );
  }
}
