import { create } from "zustand";
import axios from "axios";

export interface Course {
  course_id: number;
  course_code: string;
  course_name: string;
  credits: number;
}

export interface Lecturer {
  lecturer_id: number;
  lecturer_code: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface ClassSection {
  class_section_id: number;
  section_code: string;
  academic_year: string;
  semester: string;
  course_id: number;
  lecturer_id: number;
  capacity: number;
  start_date: string;
  end_date: string;
  courses?: Course | null;
  lecturers?: Lecturer | null;
}

interface ClassSectionStore {
  // Pagination + Search
  page: number;
  pageSize: number;
  search: string;

  // Filters
  semesterFilters: string[];

  // Sorting
  sortBy: keyof ClassSection | "";
  sortOrder: "asc" | "desc";

  // Modal + Selected
  editingSection: ClassSection | null;
  selectedSection: ClassSection | null;
  addOpen: boolean;
  openFilter: boolean;

  // Data
  sections: ClassSection[];
  total: number;
  loading: boolean;

  // Setters
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSearch: (search: string) => void;
  setSemesterFilters: (updater: ((prev: string[]) => string[]) | string[]) => void;
  setSortBy: (field: keyof ClassSection | "") => void;
  setSortOrder: (order: "asc" | "desc") => void;
  setEditingSection: (cls: ClassSection | null) => void;
  setSelectedSection: (cls: ClassSection | null) => void;
  setAddOpen: (isOpen: boolean) => void;
  setOpenFilter: (isOpen: boolean) => void;

  // Actions
  fetchClassSections: () => Promise<void>;
}

export const useClassSectionStore = create<ClassSectionStore>((set, get) => ({
  // Pagination + Search
  page: 1,
  pageSize: 10,
  search: "",

  // Filters
  semesterFilters: [],

  // Sorting
  sortBy: "",
  sortOrder: "asc",

  // Modal + Selected
  editingSection: null,
  selectedSection: null,
  addOpen: false,
  openFilter: false,

  // Data
  sections: [],
  total: 0,
  loading: false,

  // Setters
  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize }),
  setSearch: (search) => set({ search }),
  setSemesterFilters: (updater) =>
    set((state) => ({
      semesterFilters:
        typeof updater === "function" ? updater(state.semesterFilters) : updater,
    })),
  setSortBy: (field) => set({ sortBy: field }),
  setSortOrder: (order) => set({ sortOrder: order }),
  setEditingSection: (cls) => set({ editingSection: cls }),
  setSelectedSection: (cls) => set({ selectedSection: cls }),
  setAddOpen: (isOpen) => set({ addOpen: isOpen }),
  setOpenFilter: (isOpen) => set({ openFilter: isOpen }),

  // Fetch data
  fetchClassSections: async () => {
    const { page, pageSize, search, semesterFilters, sortBy, sortOrder } = get();

    set({ loading: true });
    try {
      const res = await axios.get("/api/class_section", {
        params: {
          page,
          limit: pageSize,
          search,
          semester: semesterFilters.join(","),
          sortBy,
          sortOrder,
        },
      });

      set({
        sections: res.data.data || [],
        total: res.data.total || 0,
        loading: false,
      });
    } catch (err) {
      console.error("Fetch class sections failed:", err);
      set({ loading: false });
    }
  },
}));
