// /app/api/class_section/[id]/students/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const classSectionId = parseInt(params.id, 10);

    if (isNaN(classSectionId)) {
      return NextResponse.json({ error: "Invalid class_section_id" }, { status: 400 });
    }

    // Lấy danh sách enrollment kèm sinh viên
    const enrollments = await prisma.enrollment.findMany({
      where: { class_section_id: classSectionId },
      include: {
        students: {
            include: {
                academic_class: true,
            }
        },
        class_section: {
          select: {
            section_code: true,
            academic_year: true,
            semester: true,
            courses: {
              select: {
                course_code: true,
                course_name: true,
                credits: true,
              },
            },
          },
        },
        grades: true,
      },
      orderBy: { students: { first_name: "asc" } },
    });

    const studentList = enrollments.map((e) => ({
      enrollment_id: e.enrollment_id,
      status: e.status,
      student: {
        student_id: e.students.student_id,
        student_code: e.students.student_code,
        first_name: e.students.first_name,
        last_name: e.students.last_name,
        email: e.students.email,
        phone: e.students.phone,
        avatar: e.students.avatar,
        cohort: e.students.cohort,
        dob: e.students.dob,
        class_code: e.students.academic_class?.class_code,
      },
      class_section: {
        section_code: e.class_section.section_code,
        academic_year: e.class_section.academic_year,
        semester: e.class_section.semester,
        course: e.class_section.courses,
      },
      grades: e.grades,
    }));

    return NextResponse.json(studentList);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
