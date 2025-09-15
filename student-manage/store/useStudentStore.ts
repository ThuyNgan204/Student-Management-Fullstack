import { create } from "zustand";

export interface Student {
  id: number;
  name: string;
  class_name: string;
}

interface StudentStore {
  page: number;
  pageSize: number;
  search: string;
  editingStudent: Student | null;
  selectedStudent: Student | null;

  setPage: (page: number) => void;
  setPageSize: (page_size: number) => void;
  setSearch: (search: string) => void;
  setEditingStudent: (student: Student | null) => void;
  setSelectedStudent: (student: Student | null) => void;
}

export const useStudentStore = create<StudentStore>((set) => ({
  page: 1,
  pageSize: 10,
  search: "",
  editingStudent: null,
  selectedStudent: null,

  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({pageSize}),
  setSearch: (search) => set({ search }),
  setEditingStudent: (student) => set({ editingStudent: student }),
  setSelectedStudent: (student) => set({ selectedStudent: student }),
}));
