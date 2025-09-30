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
  department: z.string().min(1, { message: "Department is required." }),
});

export type TeacherFormInputs = z.infer<typeof teacherSchema>;