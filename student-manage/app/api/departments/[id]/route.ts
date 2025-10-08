import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 📌 GET: Lấy chi tiết khoa theo ID
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const department = await prisma.departments.findUnique({
      where: { department_id: id },
    });

    if (!department) {
      return NextResponse.json({ error: "Không tìm thấy khoa" }, { status: 404 });
    }

    return NextResponse.json(department);
  } catch (error) {
    console.error("GET /departments/[id] error:", error);
    return NextResponse.json({ error: "Lỗi khi lấy chi tiết khoa" }, { status: 500 });
  }
}

// 📌 PUT: Cập nhật thông tin khoa
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const { department_code, department_name } = await req.json();

    const updated = await prisma.departments.update({
      where: { department_id: id },
      data: { department_code, department_name },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /departments/[id] error:", error);
    return NextResponse.json({ error: "Lỗi khi cập nhật khoa" }, { status: 500 });
  }
}

// 📌 DELETE: Xóa khoa
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    await prisma.departments.delete({ where: { department_id: id } });
    return NextResponse.json({ message: "Đã xóa khoa thành công" });
  } catch (error) {
    console.error("DELETE /departments/[id] error:", error);
    return NextResponse.json({ error: "Lỗi khi xóa khoa" }, { status: 500 });
  }
}
