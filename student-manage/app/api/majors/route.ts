import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 📌 GET: Lấy danh sách ngành (có join khoa) + tìm kiếm + phân trang + sắp xếp + lọc khoa
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // --- Paging ---
    const page = Number(searchParams.get("page")) || 1;
    const pageSize = Number(searchParams.get("page_size")) || 10;
    const skip = (page - 1) * pageSize;

    // --- Sorting ---
    const sortBy = searchParams.get("sort_by") || "major_id";
    const sortOrder = searchParams.get("sort_order") === "desc" ? "desc" : "asc";

    // --- Filters ---
    const search = searchParams.get("search") || "";
    const departmentFilters = searchParams.getAll("department");

    // --- Build where clause ---
    const where: any = {};

    // 🔍 Search theo mã / tên ngành
    if (search) {
      where.OR = [
        { major_code: { contains: search, mode: "insensitive" } },
        { major_name: { contains: search, mode: "insensitive" } },
        { departments: { department_name: { contains: search, mode: "insensitive" } } },
      ];
    }

    // 🏢 Lọc theo nhiều department_id
    if (departmentFilters.length > 0) {
      where.department_id = { in: departmentFilters.map(Number) };
    }

    // --- Sort fields hợp lệ ---
    const validSortFields = ["major_id", "major_code", "major_name", "department_id"];
    const orderBy = validSortFields.includes(sortBy)
      ? { [sortBy]: sortOrder }
      : { major_id: "asc" as const };

    // --- Query dữ liệu ---
    const [total, items] = await Promise.all([
      prisma.majors.count({ where }),
      prisma.majors.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: { departments: true },
      }),
    ]);

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("❌ GET /majors error:", error);
    return NextResponse.json(
      { error: "Lỗi khi lấy danh sách ngành", details: String(error) },
      { status: 500 }
    );
  }
}

// 📌 POST: Thêm ngành mới
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { major_code, major_name, department_id } = body;

    if (!major_code || !major_name || !department_id) {
      return NextResponse.json({ error: "Thiếu dữ liệu" }, { status: 400 });
    }

    const newMajor = await prisma.majors.create({
      data: {
        major_code,
        major_name,
        department_id: Number(department_id),
      },
      include: { departments: true },
    });

    return NextResponse.json(newMajor, { status: 201 });
  } catch (error) {
    console.error("❌ POST /majors error:", error);
    return NextResponse.json(
      { error: "Lỗi khi thêm ngành", details: String(error) },
      { status: 500 }
    );
  }
}
