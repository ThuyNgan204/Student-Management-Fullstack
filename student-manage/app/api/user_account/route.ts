// app/api/user_account/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// ================= GET ALL =================
// GET /api/user_accounts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("page_size") || "10");
  const search = searchParams.get("search") || undefined;
  const roleFilters = searchParams.getAll("role");
  const sortBy = searchParams.get("sort_by") || "user_id";
  const sortOrder = searchParams.get("sort_order") === "asc" ? "asc" : "desc";

  const skip = (page - 1) * pageSize;

  // Build where clause
  const where: any = {};
  const andConditions: any[] = [];

  if (search) {
    andConditions.push({
      OR: [
        { username: { contains: search, mode: "insensitive" } },
        { role: { contains: search, mode: "insensitive" } },
        {
          lecturers: {
            OR: [
              { lecturer_code: { contains: search, mode: "insensitive" } },
              { first_name: { contains: search, mode: "insensitive" } },
            ],
          },
        },
        {
          students: {
            OR: [
              { student_code: { contains: search, mode: "insensitive" } },
              { first_name: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ],
    });
  }

  if (roleFilters.length > 0) {
    andConditions.push({ role: { in: roleFilters } });
  }

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  try {
    const [items, total] = await Promise.all([
      prisma.user_account.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          lecturers: true,
          students: true,
        },
      }),
      prisma.user_account.count({ where }),
    ]);

    return NextResponse.json({ items, total });
  } catch (error) {
    console.error("GET user_accounts error:", error);
    return NextResponse.json({ error: "Failed to fetch user accounts" }, { status: 500 });
  }
}

// ================= CREATE =================
// POST /api/user_accounts
export async function POST(req: Request) {
  const body = await req.json();

  try {
    // If client provides selected_user info (preferred)
    // selected_user: { type: 'student' | 'lecturer', id: number }
    if (body.selected_user && body.selected_user.type && body.selected_user.id) {
      const { type, id } = body.selected_user;
      if (type === "student") {
        const student = await prisma.students.findUnique({ where: { student_id: Number(id) } });
        if (!student) {
          return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        // default username & password = student_code
        const code = student.student_code || "student123";
        const hashedPassword = await bcrypt.hash(code, 10);

        const account = await prisma.user_account.create({
          data: {
            username: code,
            password: hashedPassword,
            role: "student",
            student_id: student.student_id,
            is_active: body.is_active ?? true,
          },
          include: { students: true, lecturers: true },
        });

        return NextResponse.json(account);
      } else if (type === "lecturer") {
        const lecturer = await prisma.lecturers.findUnique({ where: { lecturer_id: Number(id) } });
        if (!lecturer) {
          return NextResponse.json({ error: "Lecturer not found" }, { status: 404 });
        }

        const code = lecturer.lecturer_code || "lecturer123";
        const hashedPassword = await bcrypt.hash(code, 10);

        const account = await prisma.user_account.create({
          data: {
            username: code,
            password: hashedPassword,
            role: "lecturer",
            lecturer_id: lecturer.lecturer_id,
            is_active: body.is_active ?? true,
          },
          include: { students: true, lecturers: true },
        });

        return NextResponse.json(account);
      } else {
        return NextResponse.json({ error: "Invalid selected_user type" }, { status: 400 });
      }
    }

    // Fallback: create account from provided username/password/role (existing behavior)
    const hashedPassword = await bcrypt.hash(body.password || "admin123", 10);

    const account = await prisma.user_account.create({
      data: {
        username: body.username,
        password: hashedPassword,
        role: body.role,
        student_id: body.student_id || null,
        lecturer_id: body.lecturer_id || null,
        is_active: body.is_active ?? true,
      },
      include: {
        lecturers: true,
        students: true,
      },
    });

    return NextResponse.json(account);
  } catch (error: any) {
    console.error("POST user_account error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create user account" },
      { status: 500 }
    );
  }
}
