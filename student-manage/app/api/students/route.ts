import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("page_size") || "10");
  const search = searchParams.get("search") || undefined;
  const genderFilters = searchParams.getAll("gender");
  const classFilters = searchParams.getAll("class_code");
  const majorFilters = searchParams.getAll("major_code");
  const departmentFilters = searchParams.getAll("department_code");
  const sortBy = searchParams.get("sort_by") || "student_id";
  const sortOrder = searchParams.get("sort_order") || "desc";

  const skip = (page - 1) * pageSize;

  // Build where clause dynamically
  const where: any = {};

  const andConditions: any[] = [];

  // Search text
  if (search) {
    andConditions.push({
      OR: [
        { first_name: { contains: search, mode: "insensitive" } },
        { last_name: { contains: search, mode: "insensitive" } },
        { student_code: { contains: search, mode: "insensitive" } },
        { cohort: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        {
          academic_class: {
            OR: [
              { class_code: { contains: search, mode: "insensitive" } },
              { class_name: { contains: search, mode: "insensitive" } },
            ],
          },
        },
        {
          majors: {
            OR: [
              { major_code: { contains: search, mode: "insensitive" } },
              { major_name: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ],
    });
  }

  // Gender filter
  if (genderFilters.length > 0) {
    andConditions.push({ gender: { in: genderFilters } });
  }

  // Class filter
  if (classFilters.length > 0) {
    andConditions.push({
      academic_class: { class_code: { in: classFilters } },
    });
  }

  // Major filter
  if (majorFilters.length > 0) {
    andConditions.push({
      majors: {
        is: {
          major_code: { in: majorFilters },
        },
      },
    });
  }

  // Department filter (Khoa)
  if (departmentFilters.length > 0) {
    andConditions.push({
      majors: {
        is: {
          departments: {
            department_code: { in: departmentFilters },
          },
        },
      },
    });
  }

  // Gán AND
  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  try {
    const [items, total] = await Promise.all([
      prisma.students.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: pageSize,
        include: {
          academic_class: { include: { lecturers: true, majors: true } },
          majors: { include: { departments: true } },
        },
      }),
      prisma.students.count({ where }),
    ]);

    return NextResponse.json({ items, total });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

// ================= CREATE =================
// POST /api/students
export async function POST(req: Request) {
  const body = await req.json();

  try {
    const student = await prisma.students.create({
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
        academic_class: { include: { lecturers: true, majors: true } },
        majors: { include: { departments: true } },
      },
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 }
    );
  }
}
