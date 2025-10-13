import { z } from "zod";

export const studentSchema = z.object({
  last_name: z.string().min(1, { message: "Họ không được để trống." }),
  first_name: z.string().min(1, { message: "Tên không được để trống." }),
  student_code: z.string().min(1, { message: "Mã sinh viên không được để trống." }),
  gender: z.string().min(1, { message: "Giới tính không được để trống." }),
  dob: z.string().min(1, { message: "Ngày sinh không được để trống." }),
  address: z.string().optional(),
  phone: z.string().regex(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ"),
  email: z.string().email("Email không hợp lệ"),
  major_id: z.coerce.number(),
  academic_class_id: z.coerce.number(),
  cohort: z.string(),
  status: z.enum(["Đang học", "Bảo lưu", "Tốt nghiệp"]),
  avatar: z.string().optional(),
});

export type StudentFormInputs = z.infer<typeof studentSchema>;

export const teacherSchema = z.object({
  last_name: z.string().min(1, { message: "Họ không được để trống." }),
  first_name: z.string().min(1, { message: "Tên không được để trống." }),
  email: z.string().email({ message: "Email không hợp lệ" }),
  phone: z.string().regex(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ"),
  lecturer_code: z.string().min(1, { message: "Mã giảng viên không được để trống." }),
  gender: z.string().min(1, { message: "Giới tính không được để trống." }),
  dob: z.string().min(1, { message: "Ngày sinh không được để trống." }),
  address: z.string().optional(),
  department_id: z.coerce.number(),
  position: z.string().min(1, { message: "Chức vụ không được để trống." }),
  avatar: z.string().optional(),
});

export type TeacherFormInputs = z.infer<typeof teacherSchema>;

export const classSchema = z.object({
  class_code: z.string().min(1, { message: "Mã lớp không được để trống." }),
  class_name: z.string().min(1, { message: "Tên lớp không được để trống." }),
  cohort: z.string().min(1, { message: "Khóa học không được để trống." }),
  major_id: z.coerce.number(),
  lecturer_id: z.coerce.number(),
});

export type ClassFormInputs = z.infer<typeof classSchema>;

export const departmentSchema = z.object({
  department_name: z.string().min(1, { message: "Vui lòng nhập tên khoa" }),
  department_code: z.string().min(1, { message: "Vui lòng nhập mã khoa" }),
});

export type DepartmentFormInputs = z.infer<typeof departmentSchema>;

export const majorSchema = z.object({
  major_name: z.string().min(1, { message: "Vui lòng nhập tên ngành" }),
  major_code: z.string().min(1, { message: "Vui lòng nhập mã ngành" }),
  department_id: z.number().min(1, { message: "Vui lòng chọn khoa quản lý" }),
});

export type MajorFormInputs = z.infer<typeof majorSchema>;

export const courseSchema = z.object({
  course_name: z.string().min(1, { message: "Vui lòng nhập tên học phần" }),
  course_code: z.string().min(1, { message: "Vui lòng nhập mã học phần" }),
  credits: z.number().min(1, { message: "Số tín chỉ phải lớn hơn 0" }),
  department_id: z.number().min(1, { message: "Vui lòng chọn khoa quản lý" }),
});

export type CourseFormInputs = z.infer<typeof courseSchema>;

export const classSectionSchema = z.object({
  section_code: z.string().min(1, { message: "Mã lớp học phần không được để trống" }),
  academic_year: z.string().min(1, { message: "Năm học không được để trống" }),
  semester: z.string().min(1, { message: "Học kỳ không được để trống" }),
  course_id: z.coerce.number(),
  lecturer_id: z.coerce.number(),
  capacity: z.coerce.number().min(1, { message: "Sức chứa phải lớn hơn 0" }),
  start_date: z.string().min(1, { message: "Ngày bắt đầu không được để trống" }),
  end_date: z.string().min(1, { message: "Ngày kết thúc không được để trống" }),
});

export type ClassSectionFormInputs = z.infer<typeof classSectionSchema>;
