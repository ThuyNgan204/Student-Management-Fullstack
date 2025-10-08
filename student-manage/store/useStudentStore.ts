import { create } from "zustand";

export interface Department {
  department_id: number;
  department_name: string;
  department_code: string;
}

export interface Lecturer {
  lecturer_id: number;
  lecturer_code: string;
  first_name: string;
  last_name: string;
  gender: string;
  dob: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  department_id: number | null;
  avatar: string | null;
  position: string | null;
}

export interface AcademicClass {
  academic_class_id: number;
  class_name: string;
  class_code: string;
  cohort: string;
  major_id: number;
  lecturer_id: number;

  lecturers?: Lecturer | null;
  majors?: Major | null;
}

export interface Major {
  major_id: number;
  major_code: string;
  major_name: string;
  department_id: number;
  departments?: Department | null;
}

export interface Student {
  student_id: number;
  student_code: string;
  first_name: string;
  last_name: string;
  gender: string;
  dob: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  avatar: string | null;
  cohort: string | null;
  status: string | null;
  academic_class_id: number | null;
  major_id: number | null;

  academic_class?: AcademicClass | null;
  majors?: Major | null;
}

interface StudentStore {
  page: number;
  pageSize: number;
  search: string;

  genderFilters: string[];
  classFilters: string[];
  majorFilters: string[];
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
  setMajorFilters: (updater: ((prev: string[]) => string[]) | string[]) => void;
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
  majorFilters: [],
  selectedFilters: [],

  sortBy: "student_id",
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
  setMajorFilters: (updater) =>
    set((state) => ({
      majorFilters:
        typeof updater === "function" ? updater(state.majorFilters) : updater,
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
  setOpenFilter: (isOpenFilter) => set({ openFilter: isOpenFilter }),
}));
