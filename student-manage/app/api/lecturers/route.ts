// app/api/lecturers/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("page_size") || "10");
  const search = searchParams.get("search") || undefined;
  const genderFilters = searchParams.getAll("gender");
  const departmentFilters = searchParams.getAll("department_id").map((v) => Number(v)).filter(Boolean);
  const positionFilters = searchParams.getAll("position");
  const sortBy = searchParams.get("sort_by") || "lecturer_id";
  const sortOrder = searchParams.get("sort_order") || "desc";

  const skip = (page - 1) * pageSize;

  const andConditions: any[] = [];

  // Search across multiple fields
  if (search) {
    andConditions.push({
      OR: [
        { lecturer_code: { contains: search, mode: "insensitive" } },
        { first_name: { contains: search, mode: "insensitive" } },
        { last_name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { position: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  if (genderFilters.length > 0) {
    andConditions.push({ gender: { in: genderFilters } });
  }

  if (departmentFilters.length > 0) {
    andConditions.push({ department_id: { in: departmentFilters } });
  }

  if (positionFilters.length > 0) {
    andConditions.push({ position: { in: positionFilters } });
  }

  const where: any = {};
  if (andConditions.length > 0) where.AND = andConditions;

  const orderBy: any = {};
  orderBy[sortBy] = sortOrder === "desc" ? "desc" : "asc";

  try {
    const [items, total] = await Promise.all([
      prisma.lecturers.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          departments: true,
          academic_class: true,
        },
      }),
      prisma.lecturers.count({ where }),
    ]);

    return NextResponse.json({ items, total });
  } catch (error) {
    console.error("GET lecturers error:", error);
    return NextResponse.json({ error: "Failed to fetch lecturers" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const lecturer = await prisma.lecturers.create({
      data: {
        lecturer_code: body.lecturer_code,
        first_name: body.first_name,
        last_name: body.last_name,
        gender: body.gender || null,
        dob: body.dob ? new Date(body.dob) : null,
        phone: body.phone || null,
        email: body.email || null,
        address: body.address || null,
        department_id: body.department_id ? Number(body.department_id) : null,
        avatar: body.avatar || null,
        position: body.position || null,
      },
      include: {
        departments: true,
        academic_class: true,
      },
    });

    return NextResponse.json(lecturer);
  } catch (error) {
    console.error("POST lecturers error:", error);
    return NextResponse.json({ error: "Failed to create lecturer" }, { status: 500 });
  }
}
