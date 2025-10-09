import { create } from "zustand";

export interface Course {
  course_id: number;
  course_code: string;
  course_name: string;
  credits: number;
  department_id: number;
  departments?: {
    department_id: number;
    department_code: string;
    department_name: string;
  };
}

interface CourseStore {
  page: number;
  pageSize: number;
  search: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  addOpen: boolean;
  editingCourse: Course | null;

  departmentFilters: string[];
  openFilter: boolean;

  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSearch: (val: string) => void;
  setSortBy: (val: string) => void;
  setSortOrder: (val: "asc" | "desc") => void;
  setAddOpen: (open: boolean) => void;
  setEditingCourse: (mj: Course | null) => void;
  setDepartmentFilters: (filters: string[] | ((prev: string[]) => string[])) => void;
  setOpenFilter: (open: boolean) => void;
}

export const useCourseStore = create<CourseStore>((set) => ({
  page: 1,
  pageSize: 10,
  search: "",
  sortBy: "course_id",
  sortOrder: "asc",
  addOpen: false,
  editingCourse: null,
  departmentFilters: [],
  openFilter: false,

  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize }),
  setSearch: (search) => set({ search }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSortOrder: (sortOrder) => set({ sortOrder }),
  setAddOpen: (addOpen) => set({ addOpen }),
  setEditingCourse: (editingCourse) => set({ editingCourse }),
  setDepartmentFilters: (filters) =>
    set((state) => ({
      departmentFilters:
        typeof filters === "function" ? filters(state.departmentFilters) : filters,
    })),
  setOpenFilter: (openFilter) => set({ openFilter }),
}));
