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
  if (majorFilters.length) {
    where.majors = { major_code: { in: majorFilters } };
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
      { cohort: "asc" },
      { majors: { major_name: "asc" } },
      { academic_class: { class_code: "asc" } },
      { last_name: "asc" },
      { first_name: "asc" },
    ],
  });

  const uniqueDepartments = [
    ...new Set(students.map((s) => s.majors?.departments?.department_name).filter(Boolean)),
  ];
  const uniqueMajors = [
    ...new Set(students.map((s) => s.majors?.major_name).filter(Boolean)),
  ];

  const showDepartmentCol = uniqueDepartments.length > 1;
  const showMajorCol = uniqueMajors.length > 1;

  const showFilterInfo = classFilters.length || majorFilters.length;

  // === Nhóm để merge cell ===
  const groupedByDeptMajor: Record<string, any[]> = {};
  students.forEach((s) => {
    const key = `${s.majors?.departments?.department_name ?? ""}||${s.majors?.major_name ?? ""}`;
    if (!groupedByDeptMajor[key]) groupedByDeptMajor[key] = [];
    groupedByDeptMajor[key].push(s);
  });

  // === Render table rows ===
  let tableRows = "";
  let index = 1;
  for (const [key, group] of Object.entries(groupedByDeptMajor)) {
    const [deptName, majorName] = key.split("||");

    group.forEach((s, i) => {
      tableRows += `<tr>`;

      // Cột STT
      tableRows += `<td>${index++}</td>`;

      // Merge cell khoa
      if (showDepartmentCol) {
        if (i === 0) {
          tableRows += `<td rowspan="${group.length}">${deptName}</td>`;
        }
      }

      // Merge cell chuyên ngành
      if (showMajorCol) {
        if (i === 0) {
          tableRows += `<td rowspan="${group.length}">${majorName}</td>`;
        }
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
      hr { border: none; border-top: 1px solid #000; margin: 2px auto; width: 160px; }
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
        ? `<h3 style="text-align: center; font-size: 13px; margin: 6px 0;">
            Ngành: ${majorFilters.length ? majorFilters.join(", ") : "Tất cả"} — 
            Lớp: ${classFilters.length ? classFilters.join(", ") : "Tất cả"}
          </h3>`
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
