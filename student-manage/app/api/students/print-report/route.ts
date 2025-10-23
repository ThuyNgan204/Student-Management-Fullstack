// /app/api/students/print-report/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const classFilters = (searchParams.get("class_code") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const majorFilters = (searchParams.get("major_code") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const departmentFilters = (searchParams.get("department_code") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const genderFilters = (searchParams.get("gender") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const search = (searchParams.get("search") || "").trim();
  const title = decodeURIComponent(searchParams.get("title") || "DANH SÁCH SINH VIÊN");

  const where: any = {};

  if (classFilters.length) {
    where.academic_class = { class_code: { in: classFilters } };
  }

  // Lọc theo majors và/hoặc departments (nếu có)
  if (majorFilters.length) {
    where.majors = {
      ...where.majors,
      major_code: { in: majorFilters },
    };
  }

  if (departmentFilters.length) {
    where.majors = {
      ...where.majors,
      departments: {
        department_code: { in: departmentFilters },
      },
    };
  }

  if (genderFilters.length) {
    where.gender = { in: genderFilters };
  }

  if (search) {
    where.OR = [
      { student_code: { contains: search, mode: "insensitive" } },
      { first_name: { contains: search, mode: "insensitive" } },
      { last_name: { contains: search, mode: "insensitive" } },
    ];
  }

  const students = await prisma.students.findMany({
    where,
    include: {
      academic_class: true,
      majors: { include: { departments: true } },
    },
    orderBy: [
      { majors: { major_name: "asc" } },
      { academic_class: { class_code: "asc" } },
      { cohort: "asc" },
      { first_name: "asc" },
      { last_name: "asc" },
    ],
  });

  const uniqueDepartments = [
    ...new Set(
      students
        .map((s) => s.majors?.departments?.department_name)
        .filter(Boolean)
    ),
  ];
  const uniqueMajors = [
    ...new Set(students.map((s) => s.majors?.major_name).filter(Boolean)),
  ];

  const showDepartmentCol = uniqueDepartments.length > 1;
  const showMajorCol = uniqueMajors.length > 1;

  const showFilterInfo = classFilters.length || majorFilters.length || departmentFilters.length;

  // === Lấy tên chuyên ngành, lớp, khoa để hiển thị ===
  const selectedMajorNames = [
    ...new Set(
      students
        .filter((s) => majorFilters.length ? majorFilters.includes(s.majors?.major_code ?? "") : false)
        .map((s) => s.majors?.major_name)
        .filter(Boolean)
    ),
  ];
  const selectedClassNames = [
    ...new Set(
      students
        .filter((s) => classFilters.length ? classFilters.includes(s.academic_class?.class_code ?? "") : false)
        .map((s) => s.academic_class?.class_code ?? s.academic_class?.class_name)
        .filter(Boolean)
    ),
  ];
  const selectedDepartmentNames = [
    ...new Set(
      students
        .filter((s) => departmentFilters.length ? departmentFilters.includes(s.majors?.departments?.department_code ?? "") : false)
        .map((s) => s.majors?.departments?.department_name)
        .filter(Boolean)
    ),
  ];

  // === Nhóm theo Khoa trước, sau đó nhóm theo Chuyên ngành ===
  const groupedByDept: Record<string, Record<string, any[]>> = {};

  students.forEach((s) => {
    const deptName = s.majors?.departments?.department_name ?? "Khác";
    const majorName = s.majors?.major_name ?? "Không rõ";

    if (!groupedByDept[deptName]) groupedByDept[deptName] = {};
    if (!groupedByDept[deptName][majorName]) groupedByDept[deptName][majorName] = [];

    groupedByDept[deptName][majorName].push(s);
  });

  // === Render bảng ===
  let tableRows = "";
  let index = 1;

  for (const [deptName, majors] of Object.entries(groupedByDept)) {
    const totalDeptStudents = Object.values(majors).reduce((sum, arr) => sum + arr.length, 0);
    let deptRendered = false;

    for (const [majorName, studentsInMajor] of Object.entries(majors)) {
      studentsInMajor.forEach((s, i) => {
        tableRows += `<tr>`;
        tableRows += `<td>${index++}</td>`;

        // === Gộp cột Khoa ===
        if (showDepartmentCol && !deptRendered) {
          tableRows += `<td rowspan="${totalDeptStudents}">${deptName}</td>`;
          deptRendered = true;
        }

        // === Gộp cột Chuyên ngành ===
        if (showMajorCol && i === 0) {
          tableRows += `<td rowspan="${studentsInMajor.length}">${majorName}</td>`;
        }

        tableRows += `
          <td>${[s.last_name, s.first_name].filter(Boolean).join(" ")}</td>
          <td>${s.student_code ?? ""}</td>
          <td>${s.gender ?? ""}</td>
          <td>${s.academic_class?.class_code ?? ""}</td>
          <td>${s.cohort ?? ""}</td>
        </tr>`;
      });
    }
  }

  const html = `
  <!DOCTYPE html>
  <html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <title>${title}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
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

    <h1 style="text-transform: uppercase; font-size: 16px; text-align: center; margin: 6px 0;">
      ${title}
    </h1>

    ${
      showFilterInfo
        ? `
          <div style="text-align: center; font-size: 13px; margin: 6px 0;">
            ${selectedDepartmentNames.length ? `<div>Khoa: ${selectedDepartmentNames.join(", ")}</div>` : ""}
            ${selectedMajorNames.length ? `<div>Ngành: ${selectedMajorNames.join(", ")}</div>` : ""}
            ${selectedClassNames.length ? `<div>Lớp: ${selectedClassNames.join(", ")}</div>` : ""}
          </div>
        `
        : ""
    }

    <table>
      <thead>
        <tr>
          <th style="width:40px">STT</th>
          ${showDepartmentCol ? `<th>Khoa</th>` : ""}
          ${showMajorCol ? `<th>Chuyên ngành</th>` : ""}
          <th>Họ và Tên</th>
          <th>MSSV</th>
          <th>Giới tính</th>
          <th>Lớp sinh hoạt</th>
          <th>Khóa</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>

    <script>
      window.addEventListener('load', function() {
        setTimeout(() => window.print(), 250);
      });
    </script>

  </body>
  </html>
  `;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
