import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ================= GET ALL =================
// GET /api/academic_class
export async function GET() {
  try {
    const classes = await prisma.academic_class.findMany({
      include: {
        majors: true,
        lecturers: true,
      },
    });
    return NextResponse.json(classes);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 });
  }
}

// ================= CREATE =================
// POST /api/academic_class
export async function POST(req: Request) {
  const body = await req.json();

  try {
    const academicClass = await prisma.academic_class.create({
      data: {
        class_code: body.class_code,
        class_name: body.class_name,
        cohort: body.cohort,
        major_id: body.major_id,
        lecturer_id: body.lecturer_id,
      },
    });
    return NextResponse.json(academicClass);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create class" }, { status: 500 });
  }
}
