import { z } from "zod";

export const studentSchema = z.object({
  last_name: z.string().min(1, { message: "Last name is required." }),
  first_name: z.string().min(1, { message: "First name is required." }),
  student_code: z.string().min(1, { message: "Student code is required." }),
  gender: z.string().min(1, { message: "Gender is required." }),
  dob: z.string().min(1, { message: "Date of birth is required." }),
  address: z.string().optional(),
  phone: z.string().regex(/^[0-9]{10,11}$/, "Invalid phone number"),
  email: z.string().email("Invalid email"),
  major_id: z.coerce.number(),
  academic_class_id: z.coerce.number(),
  cohort: z.string(),
  status: z.enum(["Đang học", "Bảo lưu", "Tốt nghiệp"]),
});

export type StudentFormInputs = z.infer<typeof studentSchema>;

export const teacherSchema = z.object({
  last_name: z.string().min(1, { message: "Last name is required." }),
  first_name: z.string().min(1, { message: "First name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().regex(/^[0-9]{10,11}$/, "Invalid phone number"),
  lecturer_code: z.string().min(1, { message: "Lecturer code is required." }),
  gender: z.string().min(1, { message: "Gender is required." }),
  dob: z.string().min(1, { message: "Date of birth is required." }),
  address: z.string().optional(),
  department_id: z.coerce.number(),
  position: z.string().min(1, { message: "Position is required." }),
  avatar: z.string().optional(),
});

export type TeacherFormInputs = z.infer<typeof teacherSchema>;

export const classSchema = z.object({
  class_code: z.string().min(1, { message: "Class code is required." }),
  class_name: z.string().min(1, { message: "Class name is required." }),
  cohort: z.string().min(1, { message: "Cohort is required." }),
  major_id: z.coerce.number(),
  lecturer_id: z.coerce.number(),
});

export type ClassFormInputs = z.infer<typeof classSchema>;

export const departmentSchema = z.object({
  department_name: z.string().min(1, "Vui lòng nhập tên khoa"),
  department_code: z.string().min(1, "Vui lòng nhập mã khoa"),
});

export type DepartmentFormInputs = z.infer<typeof departmentSchema>;