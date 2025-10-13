import React from "react";

export default function ClassDetail({ academicClass }: { academicClass: any }) {
  const lecturer = academicClass.lecturers;
  const major = academicClass.majors;
  const department = major?.departments;
  const lecturerDept = lecturer?.departments;

  return (
    <div className="grid grid-cols-12 gap-y-3 gap-x-6">
      {/* ID */}
      <div className="col-span-4 text-gray-500 font-medium">ID lớp học:</div>
      <div className="col-span-8">{academicClass.academic_class_id ?? "N/A"}</div>

      {/* Tên lớp */}
      <div className="col-span-4 text-gray-500 font-medium">Tên lớp:</div>
      <div className="col-span-8">{academicClass.class_name ?? "N/A"}</div>

      {/* Mã lớp */}
      <div className="col-span-4 text-gray-500 font-medium">Mã lớp:</div>
      <div className="col-span-8">{academicClass.class_code ?? "N/A"}</div>

      {/* Niên khóa */}
      <div className="col-span-4 text-gray-500 font-medium">Niên khóa:</div>
      <div className="col-span-8">{academicClass.cohort ?? "N/A"}</div>

      {/* Ngành học */}
      <div className="col-span-4 text-gray-500 font-medium">Ngành học:</div>
      <div className="col-span-8">
        {major ? `${major.major_name} (${major.major_code})` : "N/A"}
      </div>

      {/* Khoa (thuộc ngành) */}
      <div className="col-span-4 text-gray-500 font-medium">Khoa:</div>
      <div className="col-span-8">
        {department
          ? `${department.department_name} (${department.department_code})`
          : "N/A"}
      </div>

      {/* Giảng viên phụ trách */}
      <div className="col-span-4 text-gray-500 font-medium">
        Giảng viên phụ trách:
      </div>
      <div className="col-span-8">
        {lecturer
          ? `${lecturer.last_name} ${lecturer.first_name} (${lecturer.lecturer_code})`
          : "Chưa phân công"}
      </div>

      {/* Chức vụ */}
      <div className="col-span-4 text-gray-500 font-medium">Chức vụ:</div>
      <div className="col-span-8">{lecturer?.position ?? "N/A"}</div>

      {/* Khoa của giảng viên */}
      <div className="col-span-4 text-gray-500 font-medium">
        Khoa giảng viên:
      </div>
      <div className="col-span-8">
        {lecturerDept
          ? `${lecturerDept.department_name} (${lecturerDept.department_code})`
          : "N/A"}
      </div>

      {/* Email */}
      <div className="col-span-4 text-gray-500 font-medium">Email:</div>
      <div className="col-span-8">{lecturer?.email ?? "N/A"}</div>

      {/* SĐT */}
      <div className="col-span-4 text-gray-500 font-medium">Số điện thoại:</div>
      <div className="col-span-8">{lecturer?.phone ?? "N/A"}</div>

      {/* Địa chỉ */}
      <div className="col-span-4 text-gray-500 font-medium">Địa chỉ:</div>
      <div className="col-span-8">{lecturer?.address ?? "N/A"}</div>
    </div>
  );
}
