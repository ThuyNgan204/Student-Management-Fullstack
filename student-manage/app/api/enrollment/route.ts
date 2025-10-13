// /app/api/enrollment/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("page_size") || "10");
  const search = searchParams.get("search") || undefined;
  const studentId = searchParams.get("student_id");
  const classSectionId = searchParams.get("class_section_id");
  const statusFilters = searchParams.getAll("status").filter(Boolean);
  const sortBy = searchParams.get("sort_by") || "enrollment_id";
  const sortOrder = searchParams.get("sort_order") === "asc" ? "asc" : "desc";

  const skip = (page - 1) * pageSize;
  const where: any = {};
  const and: any[] = [];

  if (search) {
    and.push({
      OR: [
        { status: { contains: search, mode: "insensitive" } },
        {
          students: {
            OR: [
              { student_code: { contains: search, mode: "insensitive" } },
              { last_name: { contains: search, mode: "insensitive" } },
              { first_name: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ],
    });
  }

  if (studentId) and.push({ student_id: Number(studentId) });
  if (classSectionId) and.push({ class_section_id: Number(classSectionId) });
  if (statusFilters.length) and.push({ status: { in: statusFilters } });

  if (and.length) where.AND = and;

  try {
    const [items, total] = await Promise.all([
      prisma.enrollment.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: pageSize,
        include: {
          students: {
            select: {
              student_id: true,
              student_code: true,
              first_name: true,
              last_name: true,
              academic_class_id: true,
            },
          },
          class_section: {
            include: {
              courses: {
                select: {
                  course_id: true,
                  course_code: true,
                  course_name: true,
                },
              },
            },
          },
        },
      }),
      prisma.enrollment.count({ where }),
    ]);

    return NextResponse.json({ items, total });
  } catch (err) {
    console.error("GET /api/enrollment error:", err);
    return NextResponse.json({ error: "Failed to fetch enrollments" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  const { student_id, class_section_id, status } = body;

  if (!student_id || !class_section_id) {
    return NextResponse.json(
      { error: "student_id and class_section_id are required" },
      { status: 400 }
    );
  }

  try {
    // check duplicate
    const existing = await prisma.enrollment.findFirst({
      where: {
        student_id: Number(student_id),
        class_section_id: Number(class_section_id),
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Student already registered for this class section" },
        { status: 400 }
      );
    }

    // check capacity
    const count = await prisma.enrollment.count({
      where: { class_section_id: Number(class_section_id) },
    });
    const cls = await prisma.class_section.findUnique({
      where: { class_section_id: Number(class_section_id) },
    });

    if (!cls)
      return NextResponse.json({ error: "Class section not found" }, { status: 404 });

    if (cls.capacity != null && count >= cls.capacity) {
      return NextResponse.json(
        { error: "Class section is full" },
        { status: 400 }
      );
    }

    const created = await prisma.enrollment.create({
      data: {
        student_id: Number(student_id),
        class_section_id: Number(class_section_id),
        status: status || "Đang học",
      },
      include: {
        students: {
          select: {
            student_id: true,
            student_code: true,
            first_name: true,
            last_name: true,
          },
        },
        class_section: {
          include: {
            courses: true,
          },
        },
      },
    });

    return NextResponse.json(created);
  } catch (err) {
    console.error("POST /api/enrollment error:", err);
    return NextResponse.json({ error: "Failed to create enrollment" }, { status: 500 });
  }
}
