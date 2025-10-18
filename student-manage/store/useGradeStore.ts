import { create } from "zustand";
import axios from "axios";

export interface Grade {
  grade_id: number;
  enrollment_id: number;
  total_score: number;
  letter_grade: string;
  status: string;
  attendance_score: number;
  midterm_score: number;
  assignment_score: number;
  final_score: number;

  enrollment?: {
    enrollment_id: number;
    students?: {
      student_id: number;
      student_code: string;
      first_name: string;
      last_name: string;
    };
    class_section?: {
      class_section_id: number;
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

  studentFilters: number[];
  classSectionFilters: number[];

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

  setStudentFilters: (ids: number[]) => void;
  setClassSectionFilters: (ids: number[]) => void;

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

  studentFilters: [],
  classSectionFilters: [],

  addOpen: false,
  editingGrade: null,
  selectedGrade: null,
  grades: [],
  total: 0,
  loading: false,

  setPage: (p) => set({ page: p }),
  setPageSize: (n) => set({ pageSize: n }),
  setSearch: (s) => set({ search: s, page: 1 }),
  setSortBy: (s) => set({ sortBy: s }),
  setSortOrder: (s) => set({ sortOrder: s }),

  setStudentFilters: (ids) => set({ studentFilters: ids, page: 1 }),
  setClassSectionFilters: (ids) => set({ classSectionFilters: ids, page: 1 }),

  setAddOpen: (open) => set({ addOpen: open }),
  setEditingGrade: (g) => set({ editingGrade: g }),
  setSelectedGrade: (g) => set({ selectedGrade: g }),

  resetFilters: () => set({ studentFilters: [], classSectionFilters: [], page: 1 }),

  fetchGrades: async () => {
    const {
      page,
      pageSize,
      search,
      sortBy,
      sortOrder,
      studentFilters,
      classSectionFilters,
    } = get();

    set({ loading: true });
    try {
      const res = await axios.get("/api/grades", {
        params: {
          page,
          page_size: pageSize,
          search,
          student_id: studentFilters.join(",") || undefined,
          class_section_id: classSectionFilters.join(",") || undefined,
          sort_by: sortBy,
          sort_order: sortOrder,
        },
      });

      set({
        grades: res.data.items || [],
        total: res.data.total || 0,
        loading: false,
      });
    } catch (err) {
      console.error("Fetch grades failed:", err);
      set({ loading: false });
    }
  },
}));
