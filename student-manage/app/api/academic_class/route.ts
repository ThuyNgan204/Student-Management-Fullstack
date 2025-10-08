import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ================= GET (READ ALL) =================
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // --- Paging ---
    const page = Number(searchParams.get("page")) || 1;
    const pageSize = Number(searchParams.get("page_size")) || 10;
    const skip = (page - 1) * pageSize;

    // --- Sorting ---
    const sortBy = searchParams.get("sort_by") || "academic_class_id";
    const sortOrder = searchParams.get("sort_order") === "desc" ? "desc" : "asc";

    // --- Filters ---
    const search = searchParams.get("search") || "";
    const cohortFilters = searchParams.get("cohort")?.split(",").filter(Boolean) || [];
    const departmentFilters = searchParams.get("department")?.split(",").filter(Boolean) || [];
    const majorFilters = searchParams.get("major")?.split(",").filter(Boolean) || [];

    // --- Build where clause ---
    const where: any = {};

    // 🔍 Search theo class_code, class_name, cohort
    if (search) {
      where.OR = [
        { class_name: { contains: search, mode: "insensitive" } },
        { class_code: { contains: search, mode: "insensitive" } },
        { cohort: { contains: search, mode: "insensitive" } },
      ];
    }

    // 🎓 Lọc theo cohort
    if (cohortFilters.length > 0) {
      where.cohort = { in: cohortFilters };
    }

    // 🏢 Lọc theo department (dựa trên mã khoa)
    if (departmentFilters.length > 0) {
      where.majors = {
        departments: {
          department_code: { in: departmentFilters },
        },
      };
    }

    // 🏫 Lọc theo major (dựa trên mã ngành)
    if (majorFilters.length > 0) {
      const majorIds = await prisma.majors.findMany({
        where: { major_code: { in: majorFilters } },
        select: { major_id: true },
      });
      where.major_id = { in: majorIds.map((m) => m.major_id) };
    }

    // --- Query dữ liệu ---
    const [total, items] = await Promise.all([
      prisma.academic_class.count({ where }),
      prisma.academic_class.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          majors: {
            include: {
              departments: true, // ✅ Lấy department của major
            },
          },
          lecturers: {
            include: {
              departments: true, // ✅ Lấy department của lecturer
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("❌ Error fetching classes:", error);
    return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 });
  }
}

// ================= CREATE (POST) =================
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const academicClass = await prisma.academic_class.create({
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
            departments: true, // ✅ Lấy department của major khi thêm
          },
        },
        lecturers: {
          include: {
            departments: true, // ✅ Lấy department của lecturer khi thêm
          },
        },
      },
    });

    return NextResponse.json(academicClass);
  } catch (error) {
    console.error("❌ Error creating class:", error);
    return NextResponse.json({ error: "Failed to create class" }, { status: 500 });
  }
}
