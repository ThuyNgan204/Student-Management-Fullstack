// store/useLecturerStore.ts
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
  gender: string | null;
  dob: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  department_id: number | null;
  avatar: string | null;
  position: string | null;
  departments?: Department | null;
}

interface LecturerStore {
  page: number;
  pageSize: number;
  search: string;

  genderFilters: string[];
  departmentFilters: (number | string)[];
  positionFilters: string[];

  sortBy: keyof Lecturer | "";
  sortOrder: "asc" | "desc";

  editingLecturer: Lecturer | null;
  selectedLecturer: Lecturer | null;
  addOpen: boolean;
  openFilter: boolean;

  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSearch: (search: string) => void;

  setGenderFilters: (updater: ((prev: string[]) => string[]) | string[]) => void;
  setDepartmentFilters: (updater: ((prev: (number | string)[]) => (number | string)[]) | (number | string)[]) => void;
  setPositionFilters: (updater: ((prev: string[]) => string[]) | string[]) => void;

  setSortBy: (field: keyof Lecturer | "") => void;
  setSortOrder: (order: "asc" | "desc") => void;

  setEditingLecturer: (student: Lecturer | null) => void;
  setSelectedLecturer: (student: Lecturer | null) => void;
  setAddOpen: (isOpen: boolean) => void;
  setOpenFilter: (isOpenFilter: boolean) => void;
}

export const useLecturerStore = create<LecturerStore>((set) => ({
  page: 1,
  pageSize: 10,
  search: "",

  genderFilters: [],
  departmentFilters: [],
  positionFilters: [],

  sortBy: "",
  sortOrder: "asc",

  editingLecturer: null,
  selectedLecturer: null,
  addOpen: false,
  openFilter: false,

  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize }),
  setSearch: (search) => set({ search }),

  setGenderFilters: (updater) =>
    set((state) => ({ genderFilters: typeof updater === "function" ? updater(state.genderFilters) : updater })),
  setDepartmentFilters: (updater) =>
    set((state) => ({ departmentFilters: typeof updater === "function" ? updater(state.departmentFilters) : updater })),
  setPositionFilters: (updater) =>
    set((state) => ({ positionFilters: typeof updater === "function" ? updater(state.positionFilters) : updater })),

  setSortBy: (field) => set({ sortBy: field }),
  setSortOrder: (order) => set({ sortOrder: order }),

  setEditingLecturer: (student) => set({ editingLecturer: student }),
  setSelectedLecturer: (student) => set({ selectedLecturer: student }),
  setAddOpen: (isOpen) => set({ addOpen: isOpen }),
  setOpenFilter: (isOpenFilter) => set({ openFilter: isOpenFilter }),
}));
