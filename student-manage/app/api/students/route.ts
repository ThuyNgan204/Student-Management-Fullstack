import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ================= GET ALL =================
// GET /api/students?page=1&page_size=10&search=...&gender=Male&sort_by=last_name&sort_order=asc
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("page_size") || "10");
  const search = searchParams.get("search") || undefined;
  const gender = searchParams.getAll("gender"); // multiple allowed
  const sortBy = searchParams.get("sort_by") || "student_id";
  const sortOrder = searchParams.get("sort_order") || "desc";

  const skip = (page - 1) * pageSize;

  // Build where clause
  const where: any = {};

  if (search) {
    where.OR = [
      { first_name: { contains: search, mode: "insensitive" } },
      { last_name: { contains: search, mode: "insensitive" } },
    ];
  }

  if (gender.length > 0) {
    where.gender = { in: gender };
  }

  // OrderBy
  const orderBy: any = {};
  orderBy[sortBy] = sortOrder === "desc" ? "desc" : "asc";

  try {
    const [items, total] = await Promise.all([
      prisma.students.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          academic_class: true,
          majors: true,
        },
      }),
      prisma.students.count({ where }),
    ]);

    return NextResponse.json({ items, total });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
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
        academic_class: {
          include: {
            lecturers: true,
            majors: true,
          },
        },
        majors: {
          include: {
            departments: true,
          },
        },
      },
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
  }
}

