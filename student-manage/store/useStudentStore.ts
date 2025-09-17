import { create } from "zustand";

export interface Student {
  id: number;
  first_name: string;
  last_name: string;
  gender: string;
  dob: string;
  class_name: string;
  created_at: string;
  updated_at: string;
}

interface StudentStore {
  page: number;
  pageSize: number;
  search: string;
  genderFilter: string;
  sortBy: keyof Student | "";
  sortOrder: "asc" | "desc";

  editingStudent: Student | null;
  selectedStudent: Student | null;
  addOpen: boolean;

  setPage: (page: number) => void;
  setPageSize: (page_size: number) => void;
  setSearch: (search: string) => void;
  setGenderFilter: (gender: string) => void;
  setSortBy: (field: keyof Student | "") => void;
  setSortOrder: (order: "asc" | "desc") => void;
  setEditingStudent: (student: Student | null) => void;
  setSelectedStudent: (student: Student | null) => void;
  setAddOpen: (isOpen: boolean) => void;
}

export const useStudentStore = create<StudentStore>((set) => ({
  page: 1,
  pageSize: 10,
  search: "",
  genderFilter: "all",
  sortBy: "",
  sortOrder: "asc",

  editingStudent: null,
  selectedStudent: null,
  addOpen: false,

  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize }),
  setSearch: (search) => set({ search }),
  setGenderFilter: (gender) => set({ genderFilter: gender }),
  setSortBy: (field) => set({ sortBy: field }),
  setSortOrder: (order) => set({ sortOrder: order }),
  setEditingStudent: (student) => set({ editingStudent: student }),
  setSelectedStudent: (student) => set({ selectedStudent: student }),
  setAddOpen: (isOpen) => set({ addOpen: isOpen }),
}));
