import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// =================== GET LIST ===================
// GET /api/class_section?page=1&page_size=10&search=abc&semester=Hè&lecturer=10
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("page_size") || "10");
  const search = searchParams.get("search") || undefined;
  const semesterFilters = searchParams.getAll("semester");
  const lecturerId = searchParams.get("lecturer");
  const sortBy = searchParams.get("sort_by") || "class_section_id";
  const sortOrder = searchParams.get("sort_order") === "asc" ? "asc" : "desc";

  const skip = (page - 1) * pageSize;

  const where: any = {};
  const andConditions: any[] = [];

  // ===== Search theo mã lớp, năm học, học kỳ, học phần, giảng viên =====
  if (search) {
    andConditions.push({
      OR: [
        { section_code: { contains: search, mode: "insensitive" } },
        { academic_year: { contains: search, mode: "insensitive" } },
        { semester: { contains: search, mode: "insensitive" } },
        {
          courses: {
            OR: [
              { course_code: { contains: search, mode: "insensitive" } },
              { course_name: { contains: search, mode: "insensitive" } },
            ],
          },
        },
        {
          lecturers: {
            OR: [
              { first_name: { contains: search, mode: "insensitive" } },
              { last_name: { contains: search, mode: "insensitive" } },
              { lecturer_code: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ],
    });
  }

  // ===== Filter theo học kỳ =====
  if (semesterFilters.length > 0) {
    andConditions.push({
      semester: { in: semesterFilters },
    });
  }

  // ===== Filter theo giảng viên =====
  if (lecturerId) {
    andConditions.push({
      lecturer_id: Number(lecturerId),
    });
  }

  if (andConditions.length > 0) where.AND = andConditions;

  try {
    const [items, total] = await Promise.all([
      prisma.class_section.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: pageSize,
        include: {
          courses: { include: { departments: true } },
          lecturers: true,
        },
      }),
      prisma.class_section.count({ where }),
    ]);

    return NextResponse.json({ items, total });
  } catch (error) {
    console.error("GET /api/class_section error:", error);
    return NextResponse.json(
      { error: "Failed to fetch class section list" },
      { status: 500 }
    );
  }
}

// =================== CREATE ===================
// POST /api/class_section
export async function POST(req: Request) {
  const body = await req.json();

  try {
    const newSection = await prisma.class_section.create({
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

    return NextResponse.json(newSection);
  } catch (error) {
    console.error("POST /api/class_section error:", error);
    return NextResponse.json(
      { error: "Failed to create class section" },
      { status: 500 }
    );
  }
}
