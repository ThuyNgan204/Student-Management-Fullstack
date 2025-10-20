import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";

export async function GET() {
  try {
    const students = await prisma.students.findMany({
      include: { academic_class: true, majors: true },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Students");

    // Header
    sheet.columns = [
      { header: "ID", key: "student_id", width: 10 },
      { header: "Họ", key: "last_name", width: 20 },
      { header: "Tên", key: "first_name", width: 20 },
      { header: "MSSV", key: "student_code", width: 15 },
      { header: "Giới tính", key: "gender", width: 10 },
      { header: "Ngày sinh", key: "dob", width: 15 },
      { header: "Số điện thoại", key: "phone", width: 15 },
      { header: "Email", key: "email", width: 25 },
      { header: "Khóa", key: "cohort", width: 10 },
      { header: "Tình trạng", key: "status", width: 10 },
      { header: "Mã lớp", key: "class_code", width: 15 },
      { header: "Mã ngành", key: "major_code", width: 15 },
    ];

    students.forEach((s) => {
      sheet.addRow({
        ...s,
        class_code: s.academic_class?.class_code,
        major_code: s.majors?.major_code,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="students.xlsx"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
