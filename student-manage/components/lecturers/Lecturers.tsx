import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TeacherFormInputs } from "@/lib/zodSchemas";
import { Department } from "@/store/useLecturerStore";
import { useForm } from "react-hook-form";

export default function LecturerForm({
  register,
  errors,
  departments,
  setValue,
  watch,
}: {
  register: ReturnType<typeof useForm<TeacherFormInputs>>["register"];
  errors: any;
  departments: Department[];
  setValue: ReturnType<typeof useForm<TeacherFormInputs>>["setValue"];
  watch: ReturnType<typeof useForm<TeacherFormInputs>>["watch"];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <Label className="mb-2">Mã Giảng viên</Label>
        <Input {...register("lecturer_code")} />
        {errors?.lecturer_code && <p className="text-xs text-red-500">{errors.lecturer_code.message}</p>}
      </div>

      <div>
        <Label className="mb-2">Giới tính</Label>
        <Select 
          onValueChange={(value) => setValue("gender", value)}
          value={watch("gender")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Chọn giới tính" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Nam">Nam</SelectItem>
            <SelectItem value="Nữ">Nữ</SelectItem>
            <SelectItem value="Khác">Khác</SelectItem>
          </SelectContent>
        </Select>
        {errors.gender && <p className="text-xs text-red-500">{errors.gender.message}</p>}
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
        <Select 
          onValueChange={(value) => setValue("department_id", Number(value))}
          value={watch("department_id") ? watch("department_id").toString() : ""}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Chọn khoa" />
          </SelectTrigger>
          <SelectContent className="max-h-60 overflow-y-auto">
            {departments.map((d) => (
              <SelectItem key={d.department_id} value={d.department_id.toString()}>
                {d.department_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.department_id && <p className="text-xs text-red-500">{errors.department_id.message}</p>}
      </div>

      <div>
        <Label className="mb-2">Chức vụ</Label>
        <Select 
          onValueChange={(value) => setValue("position", value)}
          value={watch("position")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Chọn chức vụ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Trưởng khoa">Trưởng khoa</SelectItem>
            <SelectItem value="Phó khoa">Phó khoa</SelectItem>
            <SelectItem value="Giảng viên">Giảng viên</SelectItem>
            <SelectItem value="Trợ giảng">Trợ giảng</SelectItem>
          </SelectContent>
        </Select>
        {errors.position && <p className="text-xs text-red-500">{errors.position.message}</p>}

      </div>

      <div className="col-span-2">
        <Label className="mb-2">Ảnh đại diện (URL)</Label>
        <Input {...register("avatar")} />
      </div>
    </div>
  );
}
