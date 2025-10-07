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
        <Label className="mb-2">Lecturer Code</Label>
        <Input {...register("lecturer_code")} />
        {errors?.lecturer_code && <p className="text-xs text-red-500">{errors.lecturer_code.message}</p>}
      </div>

      <div>
        <Label className="mb-2">First Name</Label>
        <Input {...register("first_name")} />
        {errors?.first_name && <p className="text-xs text-red-500">{errors.first_name.message}</p>}
      </div>

      <div>
        <Label className="mb-2">Last Name</Label>
        <Input {...register("last_name")} />
        {errors?.last_name && <p className="text-xs text-red-500">{errors.last_name.message}</p>}
      </div>

      <div>
        <Label className="mb-2">Gender</Label>
        <select {...register("gender")} className="border rounded px-2 py-1 w-full">
          <option value="">Select gender</option>
          <option value="Nam">Nam</option>
          <option value="Nữ">Nữ</option>
          <option value="Khác">Khác</option>
        </select>
      </div>

      <div>
        <Label className="mb-2">Date of Birth</Label>
        <Input type="date" {...register("dob")} />
      </div>

      <div>
        <Label className="mb-2">Phone</Label>
        <Input {...register("phone")} />
      </div>

      <div>
        <Label className="mb-2">Email</Label>
        <Input type="email" {...register("email")} />
      </div>

      <div>
        <Label className="mb-2">Department</Label>
        <select {...register("department_id")} className="border rounded px-2 py-1 w-full">
          <option value="">Select department</option>
          {departments.map((d) => (
            <option key={d.department_id} value={d.department_id}>
              {d.department_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label className="mb-2">Position</Label>
        <Input {...register("position")} />
      </div>

      <div className="col-span-2">
        <Label className="mb-2">Address</Label>
        <Input {...register("address")} />
      </div>

      <div className="col-span-2">
        <Label className="mb-2">Avatar URL</Label>
        <Input {...register("avatar")} />
      </div>
    </div>
  );
}
