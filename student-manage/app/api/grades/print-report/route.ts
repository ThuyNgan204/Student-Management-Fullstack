// /app/api/grades/print-report/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// === Hàm tính điểm chữ dựa trên điểm tổng ===
function calculateLetterGrade(total: number) {
  if (total >= 8) return { letter: "A", status: "Giỏi" };
  if (total >= 7) return { letter: "B", status: "Khá" };
  if (total >= 5.5) return { letter: "C", status: "Trung bình" };
  if (total >= 4.0) return { letter: "D", status: "Yếu" };
  return { letter: "F", status: "Trượt" };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("student_id");
  const cohort = searchParams.get("cohort"); // Năm nhập học
  const academicYear = searchParams.get("academic_year"); // Năm học (vd: 2023-2024)
  const classSectionId = searchParams.get("class_section_id"); // Lớp học phần

  // ✅ Yêu cầu ít nhất student_id hoặc class_section_id
  if (!studentId && !classSectionId) {
    return NextResponse.json({ error: "student_id or class_section_id required" }, { status: 400 });
  }

  // === Xây dựng điều kiện lọc ===
  const where: any = {};

  if (studentId) {
    where.enrollment = { student_id: Number(studentId) };
  }

  if (classSectionId) {
    where.enrollment = {
      ...(where.enrollment || {}),
      class_section_id: Number(classSectionId),
    };
  }

  if (academicYear) {
    where.enrollment = {
      ...(where.enrollment || {}),
      class_section: { academic_year: { contains: academicYear, mode: "insensitive" } },
    };
  }

  // === Lấy dữ liệu từ DB ===
  const grades = await prisma.grades.findMany({
    where,
    include: {
      enrollment: {
        include: {
          students: {
            include: { majors: { include: { departments: true } } },
          },
          class_section: { include: { courses: true } },
        },
      },
    },
    orderBy: [
      { enrollment: { students: { first_name: "asc" } } },
      { enrollment: { students: { last_name: "asc" } } },
    ],
  });

  if (!grades.length) {
    return NextResponse.json({ error: "No grades found" }, { status: 404 });
  }

  // === Nếu in theo SINH VIÊN ===
  if (studentId) {
    const enrollment = grades[0].enrollment;
    const student = enrollment.students;
    const classSection = enrollment.class_section;
    const major = student.majors;
    const departmentName = major?.departments?.department_name ?? "";

    // Tính tiêu đề báo cáo
    const cohortNum = cohort ? Number(cohort) : null;
    let reportTitle = "TOÀN KHÓA";
    if (academicYear && cohortNum) {
      const startYear = parseInt(academicYear.split("-")[0]);
      const yearNumber = startYear - cohortNum + 1;
      reportTitle = `NĂM ${yearNumber}`;
    }
    const title = `KẾT QUẢ HỌC TẬP ${reportTitle}`;

    // Tính tổng số tín chỉ và điểm trung bình
    let totalCredits = 0;
    let weightedScore = 0;
    grades.forEach((g) => {
      const credits = g.enrollment.class_section.courses?.credits || 0;
      totalCredits += credits;
      weightedScore += (Number(g.total_score) || 0) * credits;
    });
    const avgScore = totalCredits ? Number((weightedScore / totalCredits).toFixed(2)) : 0;
    const { status: avgStatus } = calculateLetterGrade(avgScore);

    // Tạo bảng điểm
    const tableRows = grades
      .map((g, idx) => {
        const course = g.enrollment.class_section.courses;
        return `
          <tr>
            <td>${idx + 1}</td>
            <td>${course?.course_name || ""}</td>
            <td>${course?.credits || ""}</td>
            <td>${g.total_score}</td>
            <td>${g.letter_grade ?? ""}</td>
          </tr>`;
      })
      .join("");

    // Xuất HTML
    const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        body { font-family: Arial; margin: 20px; }
        h1 { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #333; padding: 6px; font-size: 12px; }
        th { background: #f0f0f0; }
        .student-info { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .signature { text-align: right; margin-top: 30px;}
        .confirm {margin-right: 27px;}
        @media print { @page { size: A4; margin: 10mm; } }
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

      <h1>${title}</h1>

      <div class="student-info">
        <div>
          <p>Họ và tên: ${student.last_name} ${student.first_name}</p>
          <p>MSSV: ${student.student_code}</p>
          <p>Giới tính: ${student.gender}</p>
          <p>Ngày sinh: ${student.dob?.toLocaleDateString() ?? ""}</p>
        </div>
        <div>
          <p>Khoa: ${departmentName}</p>
          <p>Ngành: ${major?.major_name ?? ""}</p>
          <p>Khóa: ${student.cohort ?? ""}</p>
          <p>Lớp: ${classSection?.section_code ?? ""}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên học phần</th>
            <th>STC</th>
            <th>Điểm số</th>
            <th>Điểm chữ</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>

      <p>Tổng số tín chỉ: ${totalCredits}</p>
      <p>Điểm trung bình: ${avgScore}</p>
      <p>Xếp loại học lực: ${avgStatus}</p>

      <div class="signature">
        <p>Ngày ... tháng ... năm ...</p>
        <div class="confirm">
          <p>Người xác nhận</p>
        </div>
      </div>

      <script>window.onload = () => setTimeout(() => window.print(), 300);</script>
    </body>
    </html>
    `;
    return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  // === Nếu in theo LỚP HỌC PHẦN ===
  const classSection = grades[0].enrollment.class_section;
  const course = classSection.courses;
  const title = `BẢNG ĐIỂM LỚP ${classSection.section_code}`;

  // Tạo bảng điểm cho tất cả sinh viên
  const tableRows = grades
    .map((g, idx) => {
      const st = g.enrollment.students;
      return `
        <tr>
          <td>${idx + 1}</td>
          <td>${st.student_code}</td>
          <td>${st.last_name} ${st.first_name}</td>
          <td>${g.total_score}</td>
          <td>${g.letter_grade ?? ""}</td>
        </tr>`;
    })
    .join("");

  const html = `
  <!DOCTYPE html>
  <html lang="vi">
  <head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
      body { font-family: Arial; margin: 20px; }
      h1 { text-align: center; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      th, td { border: 1px solid #333; padding: 6px; font-size: 12px; }
      th { background: #f0f0f0; }
      .signature { text-align: right; margin-top: 30px;}
      .confirm {margin-right: 27px;}
      @media print { @page { size: A4; margin: 10mm; } }
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

    <h1>${title}</h1>

    <p><strong>Môn học:</strong> ${course?.course_name ?? ""}</p>
    <p><strong>Số tín chỉ:</strong> ${course?.credits ?? ""}</p>

    <table>
      <thead>
        <tr>
          <th>STT</th>
          <th>MSSV</th>
          <th>Họ tên</th>
          <th>Điểm số</th>
          <th>Điểm chữ</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>

    <div class="signature">
      <p>Ngày ... tháng ... năm ...</p>
      <div class="confirm">
        <p>Người xác nhận</p>
      </div>
    </div>

    <script>window.onload = () => setTimeout(() => window.print(), 300);</script>
  </body>
  </html>
  `;

  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
