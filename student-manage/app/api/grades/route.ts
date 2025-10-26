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
    midterm_score * 0.2 +
    assignment_score * 0.2 +
    final_score * 0.5;

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

  return { total_score: Number(total.toFixed(1)), letter_grade: letter, status };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("page_size") || "10");
  const search = searchParams.get("search") || undefined;
  const enrollmentId = searchParams.get("enrollment_id");
  const studentId = searchParams.get("student_id");
  const classSectionId = searchParams.get("class_section_id");

  const sortBy = searchParams.get("sort_by") || "grade_id";
  const sortOrder = searchParams.get("sort_order") === "asc" ? "asc" : "desc";

  const skip = (page - 1) * pageSize;
  const where: any = {};
  const and: any[] = [];

  if (search) {
    and.push({
      OR: [
        { letter_grade: { contains: search, mode: "insensitive" } },
        { status: { contains: search, mode: "insensitive" } },
        {
          enrollment: {
            students: {
              OR: [
                { first_name: { contains: search, mode: "insensitive" } },
                { last_name: { contains: search, mode: "insensitive" } },
                { student_code: { contains: search, mode: "insensitive" } },
              ],
            },
          },
        },
      ],
    });
  }

  let orderBy: any = {};
  if (sortBy === "student_name") {
    orderBy = [
      { enrollment: { students: { first_name: sortOrder } } },
      { enrollment: { students: { last_name: sortOrder } } },
    ];
  } else if (sortBy === "student_code") {
    orderBy = {
      enrollment: {
        students: {
          student_code: sortOrder,
        },
      },
    };
  } else {
    orderBy = { [sortBy]: sortOrder };
  }

  // ✅ Lọc độc lập
  if (studentId && classSectionId) {
  and.push({
    AND: [
      { enrollment: { student_id: Number(studentId) } },
      { enrollment: { class_section_id: Number(classSectionId) } },
    ],
  });
} else if (studentId) {
  and.push({ enrollment: { student_id: Number(studentId) } });
} else if (classSectionId) {
  and.push({ enrollment: { class_section_id: Number(classSectionId) } });
}

  if (and.length) where.AND = and;

  try {
    const [items, total] = await Promise.all([
      prisma.grades.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          enrollment: {
            include: {
              students: { include: { majors: true } },
              class_section: { include: { courses: true } },
            },
          },
        },
      }),
      prisma.grades.count({ where }),
    ]);
    return NextResponse.json({ items, total });
  } catch (err) {
    console.error("GET /api/grades error:", err);
    return NextResponse.json({ error: "Failed to fetch grades" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  const { enrollment_id, attendance_score, midterm_score, assignment_score, final_score } = body;

  if (!enrollment_id)
    return NextResponse.json({ error: "enrollment_id is required" }, { status: 400 });

  try {
    const existing = await prisma.grades.findFirst({
      where: { enrollment_id: Number(enrollment_id) },
    });
    if (existing)
      return NextResponse.json({ error: "Grade already exists for this enrollment" }, { status: 400 });

    const { total_score, letter_grade, status } = calculateGrade({
      attendance_score,
      midterm_score,
      assignment_score,
      final_score,
    });

    const created = await prisma.grades.create({
      data: {
        enrollment_id: Number(enrollment_id),
        attendance_score,
        midterm_score,
        assignment_score,
        final_score,
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

    return NextResponse.json(created);
  } catch (err) {
    console.error("POST /api/grades error:", err);
    return NextResponse.json({ error: "Failed to create grade" }, { status: 500 });
  }
}
