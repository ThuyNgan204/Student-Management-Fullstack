import React from "react";
import { formatDate } from "@/utils/date";

export default function EnrollmentDetail({ enrollment }: { enrollment: any }) {
  const grades = Array.isArray(enrollment.grades) ? enrollment.grades : [];

  return (
    <div className="grid grid-cols-12 gap-y-3 gap-x-6">

      <div className="col-span-4 text-gray-500 font-medium">ID:</div>
      <div className="col-span-8">{enrollment.enrollment_id ?? "N/A"}</div>

      <div className="col-span-4 text-gray-500 font-medium">Sinh viên:</div>
      <div className="col-span-8">
        {enrollment.students
          ? `${enrollment.students.student_code} — ${enrollment.students.last_name} ${enrollment.students.first_name}`
          : "N/A"}
      </div>

      <div className="col-span-4 text-gray-500 font-medium">Lớp học phần:</div>
      <div className="col-span-8">
        {enrollment.class_section ? enrollment.class_section.section_code : "N/A"}
      </div>

      <div className="col-span-4 text-gray-500 font-medium">Học phần:</div>
      <div className="col-span-8">
        {enrollment.class_section?.courses
          ? `${enrollment.class_section.courses.course_code} - ${enrollment.class_section.courses.course_name}`
          : "N/A"}
      </div>

      <div className="col-span-4 text-gray-500 font-medium">Trạng thái:</div>
      <div
        className={`col-span-8 font-semibold ${
          enrollment.status === "Hoàn thành"
            ? "text-green-600"
            : enrollment.status === "Hủy"
            ? "text-red-600"
            : "text-blue-600"
        }`}
      >
        {enrollment.status}
      </div>

      {/* ✅ Chỉ hiển thị Grades nếu backend có */}
      {grades.length > 0 && (
        <>
          <div className="col-span-4 text-gray-500 font-medium">Grades:</div>
          <div className="col-span-8 space-y-2">
            {grades.map((g: any) => (
              <div key={g.grade_id} className="p-2 border rounded bg-gray-50">
                <div>Type: {g.type}</div>
                <div>Score: {g.score}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
