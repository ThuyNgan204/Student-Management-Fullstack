// /app/api/lecturers/print-report/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const selectedDepartmentNames = (searchParams.get("selectedDepartmentNames") || "")
  .split(",")
  .map((s) => decodeURIComponent(s.trim()))
  .filter(Boolean);


  const title = decodeURIComponent(searchParams.get("title") || "DANH SÁCH GIẢNG VIÊN");
  const search = (searchParams.get("search") || "").trim();
  const genderFilters = (searchParams.get("gender") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const departmentFilters = (searchParams.get("department_code") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const positionFilters = (searchParams.get("position") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const where: any = {};

  if (departmentFilters.length) {
    where.departments = { department_code: { in: departmentFilters } };
  }

  if (genderFilters.length) {
    where.gender = { in: genderFilters };
  }

  if (positionFilters.length) {
    where.position = { in: positionFilters };
  }

  if (search) {
    where.OR = [
      { lecturer_code: { contains: search, mode: "insensitive" } },
      { first_name: { contains: search, mode: "insensitive" } },
      { last_name: { contains: search, mode: "insensitive" } },
    ];
  }

  const lecturers = await prisma.lecturers.findMany({
    where,
    include: { departments: true },
    orderBy: [
      { departments: { department_name: "asc" } },
      { first_name: "asc" },
      { last_name: "asc" },
    ],
  });

  const uniqueDepartments = [
    ...new Set(
      lecturers
        .map((s) => s.departments?.department_name)
        .filter(Boolean)
    ),
  ];

    const showDepartmentCol =
        selectedDepartmentNames.length > 1 ||
        (selectedDepartmentNames.length === 0 && uniqueDepartments.length > 1);


  // === Nhóm theo khoa ===
  const groupedByDept: Record<string, any[]> = {};
  lecturers.forEach((l) => {
    const deptName = l.departments?.department_name ?? "Khác";
    if (!groupedByDept[deptName]) groupedByDept[deptName] = [];
    groupedByDept[deptName].push(l);
  });

    let tableRows = "";
    let index = 1;

    for (const [deptName, lecturersInDepartment] of Object.entries(groupedByDept)) {
    const totalDeptLecturers = lecturersInDepartment.length;
    let deptRendered = false;

    lecturersInDepartment.forEach((l) => {
        tableRows += `<tr>`;
        tableRows += `<td>${index++}</td>`;

        // Hiển thị cột "Khoa" nếu cần
        if (showDepartmentCol && !deptRendered) {
        tableRows += `<td rowspan="${totalDeptLecturers}">${deptName}</td>`;
        deptRendered = true;
        }

        tableRows += `
        <td>${[l.last_name, l.first_name].filter(Boolean).join(" ")}</td>
        <td>${l.lecturer_code ?? ""}</td>
        <td>${l.gender ?? ""}</td>
        <td>${l.phone ?? ""}</td>
        <td>${l.email ?? ""}</td>
        <td>${l.position ?? ""}</td>
        </tr>`;
    });
    }

  const html = `
  <!DOCTYPE html>
  <html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <title>${title}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; color: #000; }
      h1 { text-align: center; font-size: 18px; margin-bottom: 4px; }
      h3 { text-align: center; font-size: 13px; font-weight: 600; margin: 2px 0; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th, td { border: 1px solid #333; padding: 6px 8px; font-size: 12px; }
      th { background: #f0f0f0; text-align: left; font-weight: 700; }
      td { vertical-align: top; }
      hr { border: none; border-top: 1px solid #2e2e2e80; margin: 2px auto; width: 160px; }
      @media print {
        @page { size: A4; margin: 10mm; }
        body { margin: 0; }
        th { background: #f0f0f0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
    </style>
  </head>
  <body>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <div style="text-align: left; font-size: 13px; line-height: 1.4;">
        <strong>TRƯỜNG ĐẠI HỌC NGÂN HÀNG</strong><br/>
        <div style="text-align: center; margin-left: -3px;">
          <strong>THÀNH PHỐ HỒ CHÍ MINH</strong><br/>
        </div>
        <hr />
      </div>
      
      <div style="font-size: 13px; line-height: 1.4; text-align: right;">
        <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br/>
        <div style="text-align: center; margin-right: -3px;">
          <strong>Độc lập - Tự do - Hạnh phúc</strong>
        </div>
        <hr />
      </div>
    </div>

    <h1 style="margin-top:10px;">${title}</h1>

    ${
    selectedDepartmentNames.length
        ? `
        <div style="text-align: center; font-size: 13px; margin: 6px 0;">
            Khoa: ${selectedDepartmentNames.join(", ")}
        </div>
        `
        : ""
    }

    <table>
      <thead>
        <tr>
          <th>STT</th>
          ${showDepartmentCol ? `<th>Khoa</th>` : ""}
          <th>Họ và tên</th>
          <th>Mã GV</th>
          <th>Giới tính</th>
          <th>Số điện thoại</th>
          <th>Email</th>
          <th>Chức vụ</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>

    <script>window.onload = () => setTimeout(() => window.print(), 300);</script>
  </body>
  </html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
