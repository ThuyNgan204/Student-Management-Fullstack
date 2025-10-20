import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Không có file được cung cấp" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const dataBuffer = Buffer.from(arrayBuffer);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(dataBuffer as any);
    const sheet = workbook.worksheets[0];

    // Đọc hàng đầu tiên làm header
    const headers = sheet.getRow(1).values as string[];

    const created: any[] = [];

    // Duyệt từ hàng 2 trở đi
    for (let i = 2; i <= sheet.rowCount; i++) {
      const row = sheet.getRow(i);
      if (!row.getCell("B").value) continue; // bỏ qua hàng trống

      const studentData = {
        last_name: row.getCell(headers.indexOf("Họ")).value as string,
        first_name: row.getCell(headers.indexOf("Tên")).value as string,
        student_code: row.getCell(headers.indexOf("MSSV")).value as string,
        gender: row.getCell(headers.indexOf("Giới tính")).value as string,
        dob: row.getCell(headers.indexOf("Ngày sinh")).value
          ? new Date(row.getCell(headers.indexOf("Ngày sinh")).value as string)
          : null,
        phone: row.getCell(headers.indexOf("Số điện thoại")).value as string,
        email: row.getCell(headers.indexOf("Email")).value as string,
        cohort: row.getCell(headers.indexOf("Khóa")).value as string,
        status: row.getCell(headers.indexOf("Tình trạng")).value as string,
        academic_class_id: Number(row.getCell(headers.indexOf("ID lớp")).value),
        major_id: Number(row.getCell(headers.indexOf("ID ngành")).value),
      };

      const student = await prisma.students.create({ data: studentData });
      created.push(student);
    }

    return NextResponse.json({
      message: `Đã nhập ${created.length} sinh viên`,
      created,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Nhập thất bại" }, { status: 500 });
  }
}
