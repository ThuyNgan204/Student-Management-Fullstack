// components/lecturers/LecturerDetailModal.tsx
import React from "react";
import { Lecturer } from "@/store/useLecturerStore";
import { formatDate } from "@/utils/date";

export default function LecturerDetail({ lecturer }: { lecturer: any }) {
  return (
    <div className="grid grid-cols-12 gap-y-3 gap-x-6">
      <div className="col-span-4 text-gray-500 font-medium">ID:</div>
      <div className="col-span-8">{lecturer.lecturer_id}</div>

      <div className="col-span-4 text-gray-500 font-medium">Họ Tên:</div>
      <div className="col-span-8">
        {lecturer.last_name} {lecturer.first_name}
      </div>

      <div className="col-span-4 text-gray-500 font-medium">Mã GV:</div>
      <div className="col-span-8">{lecturer.lecturer_code}</div>

      <div className="col-span-4 text-gray-500 font-medium">Giới tính:</div>
      <div className="col-span-8">{lecturer.gender}</div>

      <div className="col-span-4 text-gray-500 font-medium">Ngày sinh:</div>
      <div className="col-span-8">{lecturer.dob ? formatDate(lecturer.dob) : "N/A"}</div>

      <div className="col-span-4 text-gray-500 font-medium">Phone:</div>
      <div className="col-span-8">{lecturer.phone}</div>

      <div className="col-span-4 text-gray-500 font-medium">Email:</div>
      <div className="col-span-8">{lecturer.email}</div>

      <div className="col-span-4 text-gray-500 font-medium">Khoa:</div>
      <div className="col-span-8">{lecturer.departments?.department_name ?? "N/A"}</div>

      <div className="col-span-4 text-gray-500 font-medium">Chức vụ:</div>
      <div className="col-span-8">{lecturer.position}</div>

      <div className="col-span-4 text-gray-500 font-medium">Địa chỉ:</div>
      <div className="col-span-8">{lecturer.address}</div>

      <div className="col-span-4 text-gray-500 font-medium">Avatar:</div>
      <div className="col-span-8">{lecturer.avatar ? <img src={lecturer.avatar} className="h-24 w-24 object-cover rounded" /> : "N/A"}</div>
    </div>
  );
}
