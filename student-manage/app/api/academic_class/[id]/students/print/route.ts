// /app/api/academic_class/[id]/students/print/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const academicClassId = Number(params.id);

  if (isNaN(academicClassId)) {
    return NextResponse.json({ error: "ID lớp sinh hoạt không hợp lệ" }, { status: 400 });
  }

  try {
    const students = await prisma.students.findMany({
      where: { academic_class_id: academicClassId },
      include: {
        academic_class: {
          include: {
            majors: { include: { departments: true } },
            lecturers: true,
          },
        },
      },
      orderBy: { first_name: "asc" },
    });

    if (!students.length) {
      return NextResponse.json({ error: "Không có sinh viên" }, { status: 404 });
    }

    const academicClass = students[0].academic_class;

    const formatDate = (date: any) =>
      date ? new Date(date).toLocaleDateString("vi-VN") : "";

    const rowsHtml = students
      .map(
        (s, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td>${s.last_name} ${s.first_name}</td>
          <td>${s.student_code}</td>
          <td>${formatDate(s.dob)}</td>
          <td>${s.email ?? ""}</td>
          <td>${s.phone ?? ""}</td>
        </tr>
      `
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8" />
        <title>Danh sách sinh viên ${academicClass?.class_code}</title>
        <style>
          body { font-family: Arial; margin: 20px; }
          h1 { text-align: center; margin: 6px 0 12px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #333; padding: 6px; font-size: 12px; }
          th { background: #f0f0f0; text-align: center; }
          tr:nth-child(even) { background-color: #fafafa; }
          .signature { text-align: right; margin-top: 30px; font-size: 13px; }
          @media print { @page { size: A4; margin: 8mm; } }
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
      
      <div 3pstyle="font-size: 1x; line-height: 1.4; text-align: right;">
        <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br/>
        <div style="text-align: center; margin-right: -3px;">
          <strong>Độc lập - Tự do - Hạnh phúc</strong>
        </div>
        <hr />
      </div>
    </div>

      <h1>DANH SÁCH SINH VIÊN</h1>
        <div style="display: grid; grid-template-columns: 1fr 1fr; font-size: 14px; margin-top: 6px; gap: 4px 16px;">
        <div>
            <strong>Lớp sinh hoạt:</strong> ${academicClass?.class_code} - ${academicClass?.class_name}
        </div>
        <div>
            <strong>Giảng viên chủ nhiệm:</strong>
            ${
            academicClass?.lecturers
                ? `${academicClass.lecturers.last_name} ${academicClass.lecturers.first_name}`
                : ""
            }
        </div>
        <div>
            <strong>Khoa:</strong> ${academicClass?.majors?.departments?.department_name || ""}
        </div>
        <div>
            <strong>Ngành:</strong> ${academicClass?.majors?.major_name || ""}
        </div>
        </div>

      <table>
        <thead>
          <tr>
            <th>STT</th>
            <th>Họ và tên</th>
            <th>MSSV</th>
            <th>Ngày sinh</th>
            <th>Email</th>
            <th>SĐT</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div class="signature">
        <p>Ngày ... tháng ... năm ...</p>
        <p><strong>Giảng viên chủ nhiệm</strong></p>
      </div>

      <script>window.onload = () => setTimeout(() => window.print(), 300);</script>
      </body></html>`;

    return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Lỗi server khi lấy danh sách sinh viên" }, { status: 500 });
  }
}
