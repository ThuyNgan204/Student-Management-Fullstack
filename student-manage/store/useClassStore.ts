import { create } from "zustand";

export interface Department {
  department_id: number;
  department_name: string;
  department_code: string;
}

export interface Major {
  major_id: number;
  major_name: string;
  major_code: string;
  department_id?: number;
  departments?: Department | null;
}

export interface Lecturer {
  lecturer_id: number;
  lecturer_code: string;
  first_name: string;
  last_name: string;
}

export interface AcademicClass {
  academic_class_id: number;
  class_code: string;
  class_name: string;
  cohort: string;
  major_id: number;
  lecturer_id: number;
  majors?: Major | null;
  lecturers?: Lecturer | null;
}

interface ClassStore {
  // Pagination + Search
  page: number;
  pageSize: number;
  search: string;

  // Filters
  cohortFilters: string[];            // ✅ THÊM DÒNG NÀY
  departmentFilters: string[];
  majorFilters: string[];
  lecturerFilters: string[];

  // Sorting
  sortBy: keyof AcademicClass | "";
  sortOrder: "asc" | "desc";

  // Modal + Selected
  editingClass: AcademicClass | null;
  selectedClass: AcademicClass | null;
  addOpen: boolean;
  openFilter: boolean;

  // Setters
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSearch: (search: string) => void;

  setCohortFilters: (updater: ((prev: string[]) => string[]) | string[]) => void; // ✅ THÊM
  setDepartmentFilters: (updater: ((prev: string[]) => string[]) | string[]) => void;
  setMajorFilters: (updater: ((prev: string[]) => string[]) | string[]) => void;
  setLecturerFilters: (updater: ((prev: string[]) => string[]) | string[]) => void;

  setSortBy: (field: keyof AcademicClass | "") => void;
  setSortOrder: (order: "asc" | "desc") => void;

  setEditingClass: (cls: AcademicClass | null) => void;
  setSelectedClass: (cls: AcademicClass | null) => void;
  setAddOpen: (isOpen: boolean) => void;
  setOpenFilter: (isOpen: boolean) => void;
}

export const useClassStore = create<ClassStore>((set) => ({
  page: 1,
  pageSize: 10,
  search: "",

  // Filters
  cohortFilters: [],               // ✅ THÊM DÒNG NÀY
  departmentFilters: [],
  majorFilters: [],
  lecturerFilters: [],

  sortBy: "",
  sortOrder: "asc",

  editingClass: null,
  selectedClass: null,
  addOpen: false,
  openFilter: false,

  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize }),
  setSearch: (search) => set({ search }),

  setCohortFilters: (updater) =>
    set((state) => ({
      cohortFilters: typeof updater === "function" ? updater(state.cohortFilters) : updater,
    })),

  setDepartmentFilters: (updater) =>
    set((state) => ({
      departmentFilters:
        typeof updater === "function" ? updater(state.departmentFilters) : updater,
    })),

  setMajorFilters: (updater) =>
    set((state) => ({
      majorFilters: typeof updater === "function" ? updater(state.majorFilters) : updater,
    })),

  setLecturerFilters: (updater) =>
    set((state) => ({
      lecturerFilters:
        typeof updater === "function" ? updater(state.lecturerFilters) : updater,
    })),

  setSortBy: (field) => set({ sortBy: field }),
  setSortOrder: (order) => set({ sortOrder: order }),

  setEditingClass: (cls) => set({ editingClass: cls }),
  setSelectedClass: (cls) => set({ selectedClass: cls }),
  setAddOpen: (isOpen) => set({ addOpen: isOpen }),
  setOpenFilter: (isOpen) => set({ openFilter: isOpen }),
}));
