import { create } from "zustand";

export interface Student {
  student_id: number;
  first_name: string;
  last_name: string;
  gender: string;
  dob: string;
  student_code: string;
}

interface StudentStore {
  page: number;
  pageSize: number;
  search: string;
  genderFilters: string[];
  classFilters: string[];
  selectedFilters: string[];
  sortBy: keyof Student | "";
  sortOrder: "asc" | "desc";

  editingStudent: Student | null;
  selectedStudent: Student | null;
  addOpen: boolean;
  openFilter: boolean;

  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSearch: (search: string) => void;
  setGenderFilters: (updater: ((prev: string[]) => string[]) | string[]) => void;
  setClassFilters: (updater: ((prev: string[]) => string[]) | string[]) => void;
  setSelectedFilters: (updater: ((prev: string[]) => string[]) | string[]) => void;
  setSortBy: (field: keyof Student | "") => void;
  setSortOrder: (order: "asc" | "desc") => void;
  setEditingStudent: (student: Student | null) => void;
  setSelectedStudent: (student: Student | null) => void;
  setAddOpen: (isOpen: boolean) => void;
  setOpenFilter: (isOpenFilter: boolean) => void;
}

export const useStudentStore = create<StudentStore>((set) => ({
  page: 1,
  pageSize: 10,
  search: "",
  genderFilters: [],
  classFilters: [],
  selectedFilters: [],
  sortBy: "",
  sortOrder: "asc",

  editingStudent: null,
  selectedStudent: null,
  addOpen: false,
  openFilter: false,

  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize }),
  setSearch: (search) => set({ search }),
  setGenderFilters: (updater) =>
    set((state) => ({
      genderFilters:
        typeof updater === "function" ? updater(state.genderFilters) : updater,
    })),
  setClassFilters: (updater) =>
    set((state) => ({
      classFilters:
        typeof updater === "function" ? updater(state.classFilters) : updater,
    })),
  setSelectedFilters: (updater) =>
    set((state) => ({
      selectedFilters:
        typeof updater === "function" ? updater(state.selectedFilters) : updater,
    })),
  setSortBy: (field) => set({ sortBy: field }),
  setSortOrder: (order) => set({ sortOrder: order }),
  setEditingStudent: (student) => set({ editingStudent: student }),
  setSelectedStudent: (student) => set({ selectedStudent: student }),
  setAddOpen: (isOpen) => set({ addOpen: isOpen }),
  setOpenFilter: (isOpenFilter) => set({openFilter: isOpenFilter})
}));
