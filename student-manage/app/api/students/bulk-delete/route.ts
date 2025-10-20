import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request) {
  try {
    const { student_id } = await req.json(); // { student_id: [1, 2, 3] }

    if (!student_id || !Array.isArray(student_id)) {
      return NextResponse.json({ error: "Thiếu danh sách student_id" }, { status: 400 });
    }

    await prisma.students.deleteMany({
      where: { student_id: { in: student_id } }
    });

    return NextResponse.json({ message: `Đã xóa ${student_id.length} sinh viên` });
  } catch (error) {
    console.error("Bulk Delete Error:", error);
    return NextResponse.json({ error: "Lỗi khi xóa hàng loạt" }, { status: 500 });
  }
}
