import React from "react";
import { formatDate } from "@/utils/date";

export default function ClassSectionDetail({ section }: { section: any }) {
  const lecturer = section.lecturers;
  const course = section.courses;
  const department = course?.departments;

  // ✅ Lấy số lượng đã đăng ký từ API (đã tính sẵn trong backend)
  const registeredCount = section.enrolledCount ?? 0;
  const capacity = section.capacity ?? 0;
  const remaining = capacity - registeredCount;

  return (
    <div className="grid grid-cols-12 gap-y-3 gap-x-6">
      <div className="col-span-4 text-gray-500 font-medium">Mã lớp học phần:</div>
      <div className="col-span-8">{section.section_code ?? "N/A"}</div>

      <div className="col-span-4 text-gray-500 font-medium">Năm học:</div>
      <div className="col-span-8">{section.academic_year ?? "N/A"}</div>

      <div className="col-span-4 text-gray-500 font-medium">Học kỳ:</div>
      <div className="col-span-8">{section.semester ?? "N/A"}</div>

      <div className="col-span-4 text-gray-500 font-medium">Học phần:</div>
      <div className="col-span-8">
        {course ? `${course.course_name} (${course.course_code})` : "N/A"}
      </div>

      <div className="col-span-4 text-gray-500 font-medium">Khoa phụ trách:</div>
      <div className="col-span-8">
        {department
          ? `${department.department_name} (${department.department_code})`
          : "N/A"}
      </div>

      <div className="col-span-4 text-gray-500 font-medium">Giảng viên phụ trách:</div>
      <div className="col-span-8">
        {lecturer
          ? `${lecturer.last_name} ${lecturer.first_name} (${lecturer.lecturer_code})`
          : "Chưa phân công"}
      </div>

      <div className="col-span-4 text-gray-500 font-medium">Thời gian học:</div>
      <div className="col-span-8">
        {section.start_date
          ? `${formatDate(section.start_date)} → ${formatDate(section.end_date)}`
          : "Chưa xác định"}
      </div>

      <div className="col-span-4 text-gray-500 font-medium">Sức chứa:</div>
      <div className="col-span-8">{capacity}</div>

      <div className="col-span-4 text-gray-500 font-medium">Đã đăng ký:</div>
      <div
        className={`col-span-8 ${
          registeredCount >= capacity
            ? "text-red-600 font-semibold"
            : "text-green-600 font-semibold"
        }`}
      >
        {registeredCount} / {capacity}{" "}
        {remaining <= 0 ? "(Đã đầy)" : `(Còn ${remaining} chỗ)`}
      </div>

      <div className="col-span-4 text-gray-500 font-medium">Trạng thái lớp:</div>
      <div className="col-span-8">
        {registeredCount >= capacity ? "Đã đủ sinh viên" : "Còn chỗ trống"}
      </div>
    </div>
  );
}
