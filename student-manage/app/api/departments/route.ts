import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 📌 GET: Lấy danh sách khoa có tìm kiếm, phân trang, sắp xếp
// 📌 GET: Lấy danh sách khoa có tìm kiếm, phân trang, sắp xếp
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sort_by") || "department_id";
    const sortOrder = (searchParams.get("sort_order") as "asc" | "desc") || "asc";

    const validSortFields = ["department_id", "department_code", "department_name"];

    const orderBy = validSortFields.includes(sortBy)
      ? { [sortBy]: sortOrder }
      : { department_id: "asc" as const };

    const where: any = {};

    if (search) {
      where.OR = [
            { department_code: { contains: search, mode: "insensitive" } },
            { department_name: { contains: search, mode: "insensitive" } },
          ];
    }

    const [total, items] = await Promise.all([
      prisma.departments.count({where}),
      prisma.departments.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy,
      }),
    ]);

    return NextResponse.json({ items, total });
  } catch (error) {
    console.error("GET /departments error:", error);
    return NextResponse.json({ error: "Lỗi khi lấy danh sách khoa" }, { status: 500 });
  }
}


// 📌 POST: Thêm khoa mới
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { department_code, department_name } = body;

    if (!department_code || !department_name) {
      return NextResponse.json({ error: "Thiếu dữ liệu" }, { status: 400 });
    }

    const newDepartment = await prisma.departments.create({
      data: { department_code, department_name },
    });

    return NextResponse.json(newDepartment, { status: 201 });
  } catch (error) {
    console.error("POST /departments error:", error);
    return NextResponse.json({ error: "Lỗi khi thêm khoa" }, { status: 500 });
  }
}
