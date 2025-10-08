// components/lecturers/LecturerForm.tsx
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Department } from "@/store/useLecturerStore";
import { TeacherFormInputs } from "@/lib/zodSchemas";
import { useForm } from "react-hook-form";

export default function LecturerForm({
  register,
  errors,
  departments,
}: {
  register: ReturnType<typeof useForm<TeacherFormInputs>>["register"];
  errors: any;
  departments: Department[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label className="mb-2">Mã Giảng viên</Label>
        <Input {...register("lecturer_code")} />
        {errors?.lecturer_code && <p className="text-xs text-red-500">{errors.lecturer_code.message}</p>}
      </div>

      <div>
        <Label className="mb-2">Họ</Label>
        <Input {...register("last_name")} />
        {errors?.last_name && <p className="text-xs text-red-500">{errors.last_name.message}</p>}
      </div>

      <div>
        <Label className="mb-2">Tên</Label>
        <Input {...register("first_name")} />
        {errors?.first_name && <p className="text-xs text-red-500">{errors.first_name.message}</p>}
      </div>

      <div>
        <Label className="mb-2">Giới tính</Label>
        <select {...register("gender")} className="border rounded px-2 py-1 w-full">
          <option value="">Chọn giới tính</option>
          <option value="Nam">Nam</option>
          <option value="Nữ">Nữ</option>
          <option value="Khác">Khác</option>
        </select>
      </div>

      <div>
        <Label className="mb-2">Ngày sinh</Label>
        <Input type="date" {...register("dob")} />
      </div>

      <div>
        <Label className="mb-2">Số điện thoại</Label>
        <Input {...register("phone")} />
      </div>

      <div>
        <Label className="mb-2">Email</Label>
        <Input type="email" {...register("email")} />
      </div>

      <div className="col-span-2">
        <Label className="mb-2">Địa chỉ</Label>
        <Input {...register("address")} />
      </div>

      <div>
        <Label className="mb-2">Khoa phụ trách</Label>
        <select {...register("department_id")} className="border rounded px-2 py-1 w-full">
          <option value="">Chọn khoa</option>
          {departments.map((d) => (
            <option key={d.department_id} value={d.department_id}>
              {d.department_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label className="mb-2">Chức vụ</Label>
        <Input {...register("position")} />
      </div>

      <div className="col-span-2">
        <Label className="mb-2">Ảnh đại diện (URL)</Label>
        <Input {...register("avatar")} />
      </div>
    </div>
  );
}
