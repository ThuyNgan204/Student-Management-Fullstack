// /app/api/grades/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function calculateGrade(scores: {
  attendance_score?: number;
  midterm_score?: number;
  assignment_score?: number;
  final_score?: number;
}) {
  const {
    attendance_score = 0,
    midterm_score = 0,
    assignment_score = 0,
    final_score = 0,
  } = scores;

  const total =
    attendance_score * 0.1 +
    midterm_score * 0.3 +
    assignment_score * 0.2 +
    final_score * 0.4;

  let letter = "F";
  let status = "Trượt";

  if (total >= 8.5) {
    letter = "A";
    status = "Đạt";
  } else if (total >= 7.0) {
    letter = "B";
    status = "Đạt";
  } else if (total >= 5.5) {
    letter = "C";
    status = "Đạt";
  } else if (total >= 4.0) {
    letter = "D";
    status = "Trượt";
  }

  return {
    total_score: Number(total.toFixed(1)),
    letter_grade: letter,
    status,
  };
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const grade = await prisma.grades.findUnique({
      where: { grade_id: id },
      include: {
        enrollment: {
          include: {
            students: { include: { majors: true } },
            class_section: { include: { courses: true, lecturers: true } },
          },
        },
      },
    });
    if (!grade) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(grade);
  } catch (err) {
    console.error("GET /api/grades/[id] error:", err);
    return NextResponse.json({ error: "Failed to fetch grade" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const body = await req.json();

  try {
    const { total_score, letter_grade, status } = calculateGrade({
      attendance_score: body.attendance_score,
      midterm_score: body.midterm_score,
      assignment_score: body.assignment_score,
      final_score: body.final_score,
    });

    const updated = await prisma.grades.update({
      where: { grade_id: id },
      data: {
        attendance_score: body.attendance_score,
        midterm_score: body.midterm_score,
        assignment_score: body.assignment_score,
        final_score: body.final_score,
        total_score,
        letter_grade,
        status,
      },
      include: {
        enrollment: {
          include: {
            students: true,
            class_section: { include: { courses: true } },
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT /api/grades/[id] error:", err);
    return NextResponse.json({ error: "Failed to update grade" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const deleted = await prisma.grades.delete({ where: { grade_id: id } });
    return NextResponse.json({ message: "Deleted", deleted });
  } catch (err) {
    console.error("DELETE /api/grades/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete grade" }, { status: 500 });
  }
}
