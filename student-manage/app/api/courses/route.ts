import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("page_size") || "10");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sort_by") || "course_id";
    const sortOrder = searchParams.get("sort_order") === "desc" ? "desc" : "asc";

    // ✅ Lấy tất cả giá trị department (hỗ trợ ?department=1&department=2)
    const departmentFilters = searchParams.getAll("department").filter(Boolean);

    const where: any = { AND: [] };

    // 🔍 Tìm kiếm
    if (search) {
      where.AND.push({
        OR: [
          { course_name: { contains: search, mode: "insensitive" } },
          { course_code: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    // 🏢 Lọc nhiều khoa
    if (departmentFilters.length > 0) {
      where.AND.push({
        department_id: { in: departmentFilters.map((id) => Number(id)) },
      });
    }

    const [total, items] = await Promise.all([
      prisma.courses.count({ where }),
      prisma.courses.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: { departments: true },
      }),
    ]);

    return NextResponse.json({ items, total, page, pageSize });
  } catch (error) {
    console.error("❌ GET /courses error:", error);
    return NextResponse.json(
      { error: "Lỗi khi tải danh sách học phần" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { course_code, course_name, credits, department_id } = body;

    if (!course_code || !course_name || !credits || !department_id) {
      return NextResponse.json(
        { error: "Thiếu dữ liệu bắt buộc." },
        { status: 400 }
      );
    }

    const course = await prisma.courses.create({
      data: {
        course_code,
        course_name,
        credits,
        department_id: Number(department_id),
      },
      include: { departments: true },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("❌ POST /courses error:", error);
    return NextResponse.json(
      { error: "Không thể tạo học phần." },
      { status: 500 }
    );
  }
}
