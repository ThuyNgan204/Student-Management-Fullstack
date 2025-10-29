import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const classSectionId = Number(params.id);
  if (isNaN(classSectionId)) {
    return NextResponse.json({ error: "ID lớp học phần không hợp lệ" }, { status: 400 });
  }

  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { class_section_id: classSectionId },
      include: {
        students: {
            include: {
                academic_class: true,
            }
        },
        class_section: {
            include: {
                courses: true,
            }
        },
      },
      orderBy: { students: { first_name: "asc" } },
    });

    if (!enrollments.length) {
      return NextResponse.json({ error: "Không có sinh viên" }, { status: 404 });
    }

    const classSection = enrollments[0].class_section;

    // format function
    const formatDate = (date: any) =>
      date ? new Date(date).toLocaleDateString("vi-VN") : "";

    const rowsHtml = enrollments
      .map(
        (enrollment, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${enrollment.students.last_name} ${enrollment.students.first_name}</td>
        <td>${enrollment.students.student_code}</td>
        <td>${formatDate(enrollment.students.dob)}</td>
        <td>${enrollment.students.email ?? ""}</td>
        <td>${enrollment.students.phone ?? ""}</td>
        <td>${enrollment.students.academic_class?.class_code}</td>
        <td>${enrollment.students.cohort ?? ""}</td>
      </tr>
    `
      )
      .join("");

    const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8" />
      <title>Danh sách sinh viên lớp ${classSection?.section_code}</title>
      <style>
        body { font-family: Arial; margin: 20px; }
        h1 { text-align: center; margin: 6px 0 12px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #333; padding: 6px; font-size: 12px; }
        th { background: #f0f0f0; text-align: center; }
        tr:nth-child(even) { background-color: #fafafa; }
        .header { display: flex; justify-content: space-between; }
        .header div { font-size: 13px; line-height: 1.4; }
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

    <h1>DANH SÁCH SINH VIÊN LỚP HỌC PHẦN</h1>
    <p><strong>Lớp học phần:</strong> ${classSection?.section_code ?? ""}</p>
    <p><strong>Môn học:</strong> ${classSection?.courses?.course_name ?? ""}</p>

    <table>
      <thead>
        <tr>
          <th>STT</th>
          <th>Họ và tên</th>
          <th>MSSV</th>
          <th>Ngày sinh</th>
          <th>Email</th>
          <th>Số điện thoại</th>
          <th>Lớp sinh hoạt</th>
          <th>Khóa</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <div class="signature">
      <p>Ngày ... tháng ... năm ...</p>
      <p><strong>Giảng viên phụ trách</strong></p>
    </div>

    <script>
      window.onload = () => setTimeout(() => window.print(), 300);
    </script>

    </body>
    </html>
    `;

    return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Lỗi server khi lấy danh sách sinh viên" }, { status: 500 });
  }
}
