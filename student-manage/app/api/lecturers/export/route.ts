import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";

export async function GET() {
  try {
    // 🟩 1. Lấy danh sách giảng viên từ DB (sắp xếp theo ID tăng dần)
    const lecturers = await prisma.lecturers.findMany({
      include: { departments: true },
      orderBy: { lecturer_id: "asc" },
    });

    // 🟩 2. Tạo workbook & worksheet
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Danh sách Giảng viên");

    // 🟩 3. Định nghĩa header cột
    sheet.columns = [
      { header: "ID", key: "lecturer_id", width: 10 },
      { header: "Họ", key: "last_name", width: 20 },
      { header: "Tên", key: "first_name", width: 20 },
      { header: "Mã GV", key: "lecturer_code", width: 15 },
      { header: "Giới tính", key: "gender", width: 12 },
      { header: "Ngày sinh", key: "dob", width: 15 },
      { header: "Số điện thoại", key: "phone", width: 15 },
      { header: "Email", key: "email", width: 25 },
      { header: "Địa chỉ", key: "address", width: 40 },
      { header: "Chức vụ", key: "position", width: 20 },
      { header: "Khoa", key: "department_name", width: 30 },
    ];

    // 🟩 4. Thêm dữ liệu vào bảng
    lecturers.forEach((lecturer) => {
      sheet.addRow({
        ...lecturer,
        department_name: lecturer.departments?.department_name ?? "",
      });
    });

    // 🟩 5. Format header (in đậm, canh giữa, nền xám nhạt)
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FF000000" } };
    headerRow.alignment = { horizontal: "center", vertical: "middle" };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD9D9D9" },
    };

    // 🟩 6. Thêm border cho toàn bộ bảng
    sheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FFCCCCCC" } },
          left: { style: "thin", color: { argb: "FFCCCCCC" } },
          bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
          right: { style: "thin", color: { argb: "FFCCCCCC" } },
        };
      });
    });

    // 🟩 7. Xuất ra file Excel
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="lecturers.xlsx"',
      },
    });
  } catch (error) {
    console.error("❌ Export failed:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
