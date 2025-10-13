import { create } from "zustand";
import axios from "axios";

export interface Enrollment {
  enrollment_id: number;
  student_id: number;
  class_section_id: number;
  status: string;
  students?: {
    student_id: number;
    student_code: string;
    first_name: string;
    last_name: string;
  };
  class_section?: any;
  grades?: any[];
}

interface EnrollmentStore {
  // Pagination + Search
  page: number;
  pageSize: number;
  search: string;

  // Sorting
  sortBy: string;
  sortOrder: "asc" | "desc";

  // Filters
  studentFilters: number[];
  classSectionFilters: number[];
  statusFilters: string[];

  // Modal + State
  addOpen: boolean;
  editingEnrollment: Enrollment | null;
  selectedEnrollment: Enrollment | null;

  // Data
  enrollments: Enrollment[];
  total: number;
  loading: boolean;

  // Setters
  setPage: (p: number) => void;
  setPageSize: (n: number) => void;
  setSearch: (s: string) => void;
  setSortBy: (field: string) => void;
  setSortOrder: (order: "asc" | "desc") => void;
  setStudentFilters: (ids: number[] | ((prev: number[]) => number[])) => void;
  setClassSectionFilters: (ids: number[] | ((prev: number[]) => number[])) => void;
  setStatusFilters: (s: string[] | ((prev: string[]) => string[])) => void;
  setAddOpen: (open: boolean) => void;
  setEditingEnrollment: (e: Enrollment | null) => void;
  setSelectedEnrollment: (e: Enrollment | null) => void;

  resetFilters: () => void;

  // Actions
  fetchEnrollments: () => Promise<void>;
}

export const useEnrollmentStore = create<EnrollmentStore>((set, get) => ({
  page: 1,
  pageSize: 10,
  search: "",
  sortBy: "enrollment_id",
  sortOrder: "asc",

  studentFilters: [],
  classSectionFilters: [],
  statusFilters: [],

  addOpen: false,
  editingEnrollment: null,
  selectedEnrollment: null,

  enrollments: [],
  total: 0,
  loading: false,

  setPage: (p) => set({ page: p }),
  setPageSize: (n) => set({ pageSize: n }),
  setSearch: (s) => set({ search: s }),
  setSortBy: (field) => set({ sortBy: field }),
  setSortOrder: (order) => set({ sortOrder: order }),

  setStudentFilters: (ids) =>
    set((state) => ({ studentFilters: typeof ids === "function" ? ids(state.studentFilters) : ids })),
  setClassSectionFilters: (ids) =>
    set((state) => ({ classSectionFilters: typeof ids === "function" ? ids(state.classSectionFilters) : ids })),
  setStatusFilters: (s) =>
    set((state) => ({ statusFilters: typeof s === "function" ? s(state.statusFilters) : s })),

  setAddOpen: (open) => set({ addOpen: open }),
  setEditingEnrollment: (e) => set({ editingEnrollment: e }),
  setSelectedEnrollment: (e) => set({ selectedEnrollment: e }),

  resetFilters: () => set({ studentFilters: [], classSectionFilters: [], statusFilters: [] }),

  // Fetch API
  fetchEnrollments: async () => {
    const { page, pageSize, search, studentFilters, classSectionFilters, statusFilters, sortBy, sortOrder } = get();

    set({ loading: true });
    try {
      const res = await axios.get("/api/enrollment", {
        params: {
          page,
          page_size: pageSize,         // ✅ đúng với BE
          search,
          student_id: studentFilters.join(","),  // ✅ đúng với BE
          class_section_id: classSectionFilters.join(","),  // ✅ đúng với BE
          status: statusFilters,   // (có thể gửi dạng array nhiều lần: status=a&status=b)
          sort_by: sortBy,         // ✅ đúng với BE
          sort_order: sortOrder,   // ✅ đúng với BE
        },
      });

      set({
        enrollments: res.data.data || [],
        total: res.data.total || 0,
        loading: false,
      });
    } catch (err) {
      console.error("Fetch enrollments failed:", err);
      set({ loading: false });
    }
  },
}));
