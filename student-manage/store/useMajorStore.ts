import { create } from "zustand";

export interface Major {
  major_id: number;
  major_code: string;
  major_name: string;
  department_id: number;
  departments?: {
    department_id: number;
    department_code: string;
    department_name: string;
  };
}

interface MajorStore {
  page: number;
  pageSize: number;
  search: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  addOpen: boolean;
  editingMajor: Major | null;

  // 🔹 Bổ sung cho bộ lọc khoa
  departmentFilters: string[]; // danh sách mã khoa được chọn (VD: ["CNTT", "QTKD"])
  openFilter: boolean; // dropdown filter mở/đóng

  // --- Setter functions ---
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSearch: (val: string) => void;
  setSortBy: (val: string) => void;
  setSortOrder: (val: "asc" | "desc") => void;
  setAddOpen: (open: boolean) => void;
  setEditingMajor: (mj: Major | null) => void;

  // 🔹 Setter cho bộ lọc khoa
  setDepartmentFilters: (filters: string[] | ((prev: string[]) => string[])) => void;
  setOpenFilter: (open: boolean) => void;
}

export const useMajorStore = create<MajorStore>((set) => ({
  page: 1,
  pageSize: 10,
  search: "",
  sortBy: "major_id",
  sortOrder: "asc",
  addOpen: false,
  editingMajor: null,

  // 🔹 Thêm state filter khoa
  departmentFilters: [],
  openFilter: false,

  // --- Setters ---
  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize }),
  setSearch: (search) => set({ search }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSortOrder: (sortOrder) => set({ sortOrder }),
  setAddOpen: (addOpen) => set({ addOpen }),
  setEditingMajor: (editingMajor) => set({ editingMajor }),

  // 🔹 Setters cho bộ lọc
  setDepartmentFilters: (filters) =>
    set((state) => ({
      departmentFilters:
        typeof filters === "function" ? filters(state.departmentFilters) : filters,
    })),
  setOpenFilter: (openFilter) => set({ openFilter }),
}));
