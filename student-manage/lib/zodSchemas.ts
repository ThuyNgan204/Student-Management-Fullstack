import { z } from "zod";

export const studentSchema = z.object({
  last_name: z.string().min(1, { message: "Last name is required." }),
  first_name: z.string().min(1, { message: "First name is required." }),
  class_name: z.string().min(1, { message: "Class is required." }),
  gender: z.string().min(1, { message: "Gender is required." }),
  dob: z.string().min(1, { message: "Date of birth is required." }),
});

export type StudentFormInputs = z.infer<typeof studentSchema>;

export const teacherSchema = z.object({
  last_name: z.string().min(1, { message: "Last name is required." }),
  first_name: z.string().min(1, { message: "First name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  department: z.string().min(1, { message: "Department is required." }),
});

export type TeacherFormInputs = z.infer<typeof teacherSchema>;