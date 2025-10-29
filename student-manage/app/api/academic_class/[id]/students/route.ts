// /app/api/academic_class/[id]/students/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const academicClassId = parseInt(params.id, 10);

    if (isNaN(academicClassId)) {
      return NextResponse.json({ error: "Invalid academic_class_id" }, { status: 400 });
    }

    const students = await prisma.students.findMany({
      where: { academic_class_id: academicClassId },
      include: {
        academic_class: {
          include: {
            majors: {
              include: { departments: true },
            },
            lecturers: true,
          },
        },
      },
      orderBy: { first_name: "asc" },
    });

    if (!students.length) {
      return NextResponse.json({ students: [], classInfo: null }, { status: 200 });
    }

    const academicClass = students[0].academic_class;

    const classInfo = {
      class_code: academicClass?.class_code,
      class_name: academicClass?.class_name,
      cohort: academicClass?.cohort,
      lecturer: academicClass?.lecturers
        ? {
            last_name: academicClass.lecturers.last_name,
            first_name: academicClass.lecturers.first_name,
          }
        : null,
      majors: {
        major_name: academicClass?.majors?.major_name || null,
      },
      departments: {
        department_name: academicClass?.majors?.departments?.department_name || null,
      },
    };

    return NextResponse.json({
      classInfo,
      students: students.map((s) => ({
        student_id: s.student_id,
        student_code: s.student_code,
        first_name: s.first_name,
        last_name: s.last_name,
        dob: s.dob,
        email: s.email,
        phone: s.phone,
        cohort: s.cohort,
        status: s.status,
      })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
