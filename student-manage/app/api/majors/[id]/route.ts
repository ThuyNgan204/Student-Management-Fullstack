import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 📌 GET: Lấy chi tiết ngành
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);

    const major = await prisma.majors.findUnique({
      where: { major_id: id },
      include: { departments: true },
    });

    if (!major) {
      return NextResponse.json({ error: "Không tìm thấy ngành" }, { status: 404 });
    }

    return NextResponse.json(major);
  } catch (error) {
    console.error("GET /majors/[id] error:", error);
    return NextResponse.json({ error: "Lỗi khi lấy chi tiết ngành" }, { status: 500 });
  }
}

// 📌 PUT: Cập nhật ngành
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const { major_code, major_name, department_id } = await req.json();

    const updated = await prisma.majors.update({
      where: { major_id: id },
      data: { major_code, major_name, department_id },
      include: { departments: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /majors/[id] error:", error);
    return NextResponse.json({ error: "Lỗi khi cập nhật ngành" }, { status: 500 });
  }
}

// 📌 DELETE: Xóa ngành
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    await prisma.majors.delete({ where: { major_id: id } });
    return NextResponse.json({ message: "Đã xóa ngành thành công" });
  } catch (error) {
    console.error("DELETE /majors/[id] error:", error);
    return NextResponse.json({ error: "Lỗi khi xóa ngành" }, { status: 500 });
  }
}
