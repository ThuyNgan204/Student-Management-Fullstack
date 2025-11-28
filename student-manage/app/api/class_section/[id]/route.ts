import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// ✅ GET ONE
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const sectionId = Number(id);
  if (isNaN(sectionId))
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    const section = await prisma.class_section.findUnique({
      where: { class_section_id: sectionId },
      include: {
        courses: { include: { departments: true } },
        lecturers: true,
        enrollment: {
          include: {
            students: true,
            grades: true,
          },
        },
      },
    });

    if (!section)
      return NextResponse.json({ error: "Class section not found" }, { status: 404 });

    const enrolledCount = section.enrollment.filter(e => e.enrollment_id).length;

    const result = { ...section, enrolledCount };
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET one class_section error:", error);
    return NextResponse.json(
      { error: "Failed to fetch class section" },
      { status: 500 }
    );
  }
}

// ✅ UPDATE
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const sectionId = Number(id);
  const body = await req.json();

  try {
    const updated = await prisma.class_section.update({
      where: { class_section_id: sectionId },
      data: {
        section_code: body.section_code,
        academic_year: body.academic_year,
        semester: body.semester,
        course_id: body.course_id,
        lecturer_id: body.lecturer_id || null,
        capacity: body.capacity,
        start_date: body.start_date ? new Date(body.start_date) : null,
        end_date: body.end_date ? new Date(body.end_date) : null,
      },
      include: {
        courses: { include: { departments: true } },
        lecturers: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("UPDATE class_section error:", error);
    return NextResponse.json(
      { error: "Failed to update class section" },
      { status: 500 }
    );
  }
}

// ✅ DELETE
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const sectionId = Number(id);

  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { class_section_id: sectionId },
      select: { enrollment_id: true },
    });

    const enrollmentIds = enrollments.map((e) => e.enrollment_id);

    if (enrollmentIds.length > 0) {
      await prisma.grades.deleteMany({
        where: { enrollment_id: { in: enrollmentIds } },
      });
      await prisma.enrollment.deleteMany({
        where: { class_section_id: sectionId },
      });
    }

    const deleted = await prisma.class_section.delete({
      where: { class_section_id: sectionId },
    });

    return NextResponse.json({ message: "Deleted successfully", deleted });
  } catch (error: any) {
    console.error("DELETE class_section error:", error);
    return NextResponse.json(
      { error: error.message ?? "Failed to delete class section" },
      { status: 500 }
    );
  }
}
