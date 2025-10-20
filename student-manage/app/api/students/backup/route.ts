import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";

export async function POST() {
  try {
    const students = await prisma.students.findMany({
      include: { academic_class: true, majors: true },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Students");

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

    // tạo thư mục backup nếu chưa có
    const backupDir = path.join(process.cwd(), "backup");
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

    const filename = path.join(
      backupDir,
      `students_backup_${new Date().toISOString().slice(0, 10)}.xlsx`
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
