// Định nghĩa các kiểu dữ liệu dùng chung
export type Student = {
  id: number;
  last_name: string;
  first_name: string;
  class_name: string;
  gender: string;
  dob: string;
  created_at: string;
  updated_at: string;
};

export type StudentResponse = {
  items: Student[];
  total: number;
};

export type Teacher = {
  id: number;
  last_name: string;
  first_name: string;
  email: string;
  department: string;
};

// ... Thêm các type khác (Major, Course, etc.)