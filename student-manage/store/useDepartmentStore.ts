import { create } from "zustand";

export interface Department {
  department_id: number;
  department_code: string;
  department_name: string;
}

interface DepartmentStore {
  // 📋 Pagination & Sorting
  page: number;
  pageSize: number;
  search: string;
  sortBy: string;
  sortOrder: "asc" | "desc";

  // 🧩 UI States
  addOpen: boolean;
  editingDepartment: Department | null;
  selectedDepartment: Department | null;

  // 🔧 Actions
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSearch: (value: string) => void;
  setSortBy: (value: string) => void;
  setSortOrder: (value: "asc" | "desc") => void;

  // 🪟 Modal & Selection
  setAddOpen: (value: boolean) => void;
  setEditingDepartment: (dep: Department | null) => void;
  setSelectedDepartment: (dep: Department | null) => void;
}

export const useDepartmentStore = create<DepartmentStore>((set) => ({
  // 📋 Defaults
  page: 1,
  pageSize: 10,
  search: "",
  sortBy: "department_id",
  sortOrder: "asc",

  // 🧩 UI defaults
  addOpen: false,
  editingDepartment: null,
  selectedDepartment: null,

  // 🔧 Actions
  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize }),
  setSearch: (search) => set({ search }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSortOrder: (sortOrder) => set({ sortOrder }),

  // 🪟 Modal & Selection
  setAddOpen: (value) => set({ addOpen: value }),
  setEditingDepartment: (dep) => set({ editingDepartment: dep }),
  setSelectedDepartment: (dep) => set({ selectedDepartment: dep }),
}));
