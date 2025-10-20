import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request) {
  try {
    const { lecturer_id } = await req.json(); // { lecturer_id: [1, 2, 3] }

    if (!lecturer_id || !Array.isArray(lecturer_id)) {
      return NextResponse.json({ error: "Thiếu danh sách lecturer_id" }, { status: 400 });
    }

    await prisma.lecturers.deleteMany({
      where: { lecturer_id: { in: lecturer_id } }
    });

    return NextResponse.json({ message: `Đã xóa ${lecturer_id.length} sinh viên` });
  } catch (error) {
    console.error("Bulk Delete Error:", error);
    return NextResponse.json({ error: "Lỗi khi xóa hàng loạt" }, { status: 500 });
  }
}
