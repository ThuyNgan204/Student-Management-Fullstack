import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: { id: string } };

// ================= GET ONE =================
export async function GET(req: Request, { params }: Params) {
  const id = Number(params.id);
  if (isNaN(id))
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    const academicClass = await prisma.academic_class.findUnique({
      where: { academic_class_id: id },
      include: {
        majors: {
          include: {
            departments: true, // ✅ lấy luôn department của major
          },
        },
        lecturers: {
          include: {
            departments: true, // ✅ lấy luôn department của lecturer
          },
        },
      },
    });

    if (!academicClass)
      return NextResponse.json({ error: "Class not found" }, { status: 404 });

    return NextResponse.json(academicClass);
  } catch (error) {
    console.error("❌ Error fetching class:", error);
    return NextResponse.json(
      { error: "Failed to fetch class" },
      { status: 500 }
    );
  }
}

// ================= UPDATE =================
export async function PUT(req: Request, { params }: Params) {
  const id = Number(params.id);
  if (isNaN(id))
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    const body = await req.json();

    const academicClass = await prisma.academic_class.update({
      where: { academic_class_id: id },
      data: {
        class_code: body.class_code,
        class_name: body.class_name,
        cohort: body.cohort,
        major_id: body.major_id,
        lecturer_id: body.lecturer_id,
      },
      include: {
        majors: {
          include: {
            departments: true, // ✅ trả về đầy đủ sau khi update
          },
        },
        lecturers: {
          include: {
            departments: true,
          },
        },
      },
    });

    return NextResponse.json(academicClass);
  } catch (error) {
    console.error("❌ Error updating class:", error);
    return NextResponse.json(
      { error: "Failed to update class" },
      { status: 500 }
    );
  }
}

// ================= DELETE =================
export async function DELETE(req: Request, { params }: Params) {
  const id = Number(params.id);
  if (isNaN(id))
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    await prisma.academic_class.delete({ where: { academic_class_id: id } });
    return NextResponse.json({ message: "Class deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting class:", error);
    return NextResponse.json(
      { error: "Failed to delete class" },
      { status: 500 }
    );
  }
}
