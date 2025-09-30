import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: { id: string } };

// ================= GET ONE =================
// GET /api/students/:id
export async function GET(req: Request, { params }: Params) {
  const id = Number(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid student id" }, { status: 400 });
  }

  try {
    const student = await prisma.students.findUnique({
      where: { student_id: id },
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
    return NextResponse.json({ error: "Failed to fetch student" }, { status: 500 });
  }
}

// ================= UPDATE =================
// PUT /api/students/:id
export async function PUT(req: Request, { params }: Params) {
  const id = Number(params.id);
  const body = await req.json();

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid student id" }, { status: 400 });
  }

  try {
    const student = await prisma.students.update({
      where: { student_id: id },
      data: {
        first_name: body.first_name,
        last_name: body.last_name,
        student_code: body.student_code,
        gender: body.gender,
        dob: new Date(body.dob),
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
    console.error(error);
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
  }
}


// ================= DELETE =================
// DELETE /api/students/:id
export async function DELETE(req: Request, { params }: Params) {
  const id = Number(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid student id" }, { status: 400 });
  }

  try {
    await prisma.students.delete({
      where: { student_id: id },
    });

    return NextResponse.json({ message: "Student deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete student" }, { status: 500 });
  }
}
