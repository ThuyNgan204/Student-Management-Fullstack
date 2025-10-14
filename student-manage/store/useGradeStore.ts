// /store/useGradeStore.ts
import { create } from "zustand";
import axios from "axios";

export interface Grade {
  grade_id: number;
  enrollment_id: number;
  grade_type: string; // Ví dụ: "Giữa kỳ", "Cuối kỳ"
  score: number;
  note?: string;
  created_at?: string;
  updated_at?: string;

  enrollment?: {
    enrollment_id: number;
    students?: {
      student_id: number;
      student_code: string;
      first_name: string;
      last_name: string;
    };
    class_section?: {
      section_code: string;
      courses?: {
        course_name: string;
        course_code: string;
      };
    };
  };
}

interface GradeStore {
  page: number;
  pageSize: number;
  search: string;
  sortBy: string;
  sortOrder: "asc" | "desc";

  enrollmentFilters: number[];
  gradeTypeFilters: string[];

  addOpen: boolean;
  editingGrade: Grade | null;
  selectedGrade: Grade | null;

  grades: Grade[];
  total: number;
  loading: boolean;

  setPage: (p: number) => void;
  setPageSize: (n: number) => void;
  setSearch: (s: string) => void;
  setSortBy: (s: string) => void;
  setSortOrder: (s: "asc" | "desc") => void;
  setEnrollmentFilters: (ids: number[] | ((prev: number[]) => number[])) => void;
  setGradeTypeFilters: (types: string[] | ((prev: string[]) => string[])) => void;
  setAddOpen: (open: boolean) => void;
  setEditingGrade: (g: Grade | null) => void;
  setSelectedGrade: (g: Grade | null) => void;

  resetFilters: () => void;
  fetchGrades: () => Promise<void>;
}

export const useGradeStore = create<GradeStore>((set, get) => ({
  page: 1,
  pageSize: 10,
  search: "",
  sortBy: "grade_id",
  sortOrder: "asc",
  enrollmentFilters: [],
  gradeTypeFilters: [],
  addOpen: false,
  editingGrade: null,
  selectedGrade: null,
  grades: [],
  total: 0,
  loading: false,

  setPage: (p) => set({ page: p }),
  setPageSize: (n) => set({ pageSize: n }),
  setSearch: (s) => set({ search: s }),
  setSortBy: (s) => set({ sortBy: s }),
  setSortOrder: (s) => set({ sortOrder: s }),

  setEnrollmentFilters: (ids) =>
    set((state) => ({
      enrollmentFilters: typeof ids === "function" ? ids(state.enrollmentFilters) : ids,
    })),
  setGradeTypeFilters: (types) =>
    set((state) => ({
      gradeTypeFilters: typeof types === "function" ? types(state.gradeTypeFilters) : types,
    })),

  setAddOpen: (open) => set({ addOpen: open }),
  setEditingGrade: (g) => set({ editingGrade: g }),
  setSelectedGrade: (g) => set({ selectedGrade: g }),

  resetFilters: () => set({ enrollmentFilters: [], gradeTypeFilters: [] }),

  fetchGrades: async () => {
    const { page, pageSize, search, sortBy, sortOrder, enrollmentFilters, gradeTypeFilters } = get();

    set({ loading: true });
    try {
      const res = await axios.get("/api/grade", {
        params: {
          page,
          page_size: pageSize,
          search,
          enrollment_id: enrollmentFilters.join(","),
          grade_type: gradeTypeFilters,
          sort_by: sortBy,
          sort_order: sortOrder,
        },
      });
      set({
        grades: res.data.data || [],
        total: res.data.total || 0,
        loading: false,
      });
    } catch (err) {
      console.error("Fetch grades failed:", err);
      set({ loading: false });
    }
  },
}));
