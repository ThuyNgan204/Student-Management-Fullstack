import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";

export async function POST() {
  try {
    const lecturers = await prisma.lecturers.findMany({
      include: { departments: true },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Lecturers");

    sheet.columns = [
      { header: "ID", key: "lecturer_id", width: 10 },
      { header: "Họ", key: "last_name", width: 20 },
      { header: "Tên", key: "first_name", width: 20 },
      { header: "Mã GV", key: "lecturer_code", width: 15 },
      { header: "Giới tính", key: "gender", width: 10 },
      { header: "Ngày sinh", key: "dob", width: 15 },
      { header: "Số điện thoại", key: "phone", width: 15 },
      { header: "Email", key: "email", width: 25 },
      { header: "Chức vụ", key: "position", width: 10 },
      { header: "Mã khoa", key: "department_code", width: 15 },
    ];

    lecturers.forEach((s) => {
      sheet.addRow({
        ...s,
        department_code: s.departments?.department_code,
      });
    });

    // tạo thư mục backup nếu chưa có
    const backupDir = path.join(process.cwd(), "backup");
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

    const filename = path.join(
      backupDir,
      `lecturers_backup_${new Date().toISOString().slice(0, 10)}.xlsx`
    );

    await workbook.xlsx.writeFile(filename);

    return NextResponse.json({
      success: true,
      filename: filename.replace(process.cwd(), ""), // đường dẫn tương đối
    });
  } catch (error: any) {
    console.error("Backup error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
