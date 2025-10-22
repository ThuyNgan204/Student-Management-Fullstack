import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // 🟩 Nhận query params kiểu snake_case
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sort_by") || "student_id";
    const sortOrder = (searchParams.get("sort_order") as "asc" | "desc") || "asc";
    const genderFilters = searchParams.get("gender")?.split(",") || [];
    const classFilters = searchParams.get("class_code")?.split(",") || [];
    const majorFilters = searchParams.get("major_code")?.split(",") || [];
    const departmentFilters = searchParams.get("department_code")?.split(",") || [];

    // 🟩 Điều kiện lọc
    const where: any = {};

    if (search) {
      where.OR = [
        { first_name: { contains: search, mode: "insensitive" } },
        { last_name: { contains: search, mode: "insensitive" } },
        { student_code: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Lọc theo giới tính
    if (genderFilters.length) {
      where.gender = { in: genderFilters };
    }

    // Lọc theo lớp (qua bảng academic_class)
    if (classFilters.length) {
      where.academic_class = { class_code: { in: classFilters } };
    }

    // Lọc theo ngành (qua bảng majors)
    if (majorFilters.length) {
      where.majors = { major_code: { in: majorFilters } };
    }

    if (departmentFilters.length) {
      where.majors = {
        ...(where.majors || {}),
        departments: { department_code: { in: departmentFilters } },
      };
    }

    // 🟩 Lấy danh sách sinh viên theo điều kiện
    const students = await prisma.students.findMany({
      where,
      include: {
        academic_class: true,
        majors: {
          include: { departments: true },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    // 🟩 Tạo Excel
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Danh sách Sinh viên");

    sheet.columns = [
      { header: "ID", key: "student_id", width: 10 },
      { header: "Họ", key: "last_name", width: 20 },
      { header: "Tên", key: "first_name", width: 20 },
      { header: "MSSV", key: "student_code", width: 15 },
      { header: "Giới tính", key: "gender", width: 12 },
      { header: "Ngày sinh", key: "dob", width: 15 },
      { header: "Số điện thoại", key: "phone", width: 15 },
      { header: "Email", key: "email", width: 40 },
      { header: "Địa chỉ", key: "address", width: 45 },
      { header: "Khoa", key: "department_name", width: 30 },
      { header: "Ngành", key: "major_name", width: 30 },
      { header: "Lớp sinh hoạt", key: "class_name", width: 25 },
      { header: "Khóa", key: "cohort", width: 10 },
      { header: "Tình trạng", key: "status", width: 15 },
    ];

    students.forEach((student) => {
      sheet.addRow({
        ...student,
        class_name: student.academic_class?.class_name ?? "",
        major_name: student.majors?.major_name ?? "",
        department_name: student.majors?.departments?.department_name ?? "",
      });
    });

    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: "center" };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD9D9D9" },
    };

    sheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="students_filtered.xlsx"',
      },
    });
  } catch (error) {
    console.error("❌ Export failed:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
