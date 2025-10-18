import { create } from "zustand";
import axios from "axios";

export interface UserAccount {
  user_id: number;
  username: string;
  role: string;
  is_active: boolean;
  students?: {
    student_code: string;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
  } | null;
  lecturers?: {
    lecturer_code: string;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
  } | null;
}

interface UserStore {
  users: UserAccount[];
  total: number;
  loading: boolean;

  page: number;
  pageSize: number;
  search: string;
  sortField: string;
  roleFilters: string[];
  sortBy: string;
  sortOrder: "asc" | "desc";

  selectedUsers: number[];

  addOpen: boolean;
  editingUser: UserAccount | null;

  refreshKey: number; // 🔸 thêm vào interface
  triggerRefresh: () => void; // 🔸 thêm hàm này vào interface

  setPage: (p: number) => void;
  setPageSize: (n: number) => void;
  setSearch: (s: string) => void;
  setSortField: (s: string) => void;
  setRoleFilters: (roles: string[]) => void;
  setSortBy: (s: string) => void;
  setSortOrder: (s: "asc" | "desc") => void;

  toggleSelect: (id: number) => void;
  toggleSelectAll: () => void;
  clearSelection: () => void;

  setAddOpen: (b: boolean) => void;
  setEditingUser: (u: UserAccount | null) => void;

  fetchUsers: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set, get) => ({
  users: [],
  total: 0,
  loading: false,

  page: 1,
  pageSize: 10,
  search: "",
  sortField: "",
  roleFilters: [],
  sortBy: "user_id",
  sortOrder: "asc",

  selectedUsers: [],

  addOpen: false,
  editingUser: null,

  refreshKey: 0, // ✅ thêm state để trigger fetch lại

  setPage: (p) => set({ page: p }),
  setPageSize: (n) => set({ pageSize: n }),
  setSearch: (s) => set({ search: s, page: 1 }),
  setSortField: (s) => set({ sortField: s }),
  setRoleFilters: (roles) => set({ roleFilters: roles, page: 1 }),
  setSortBy: (s) => set({ sortBy: s }),
  setSortOrder: (s) => set({ sortOrder: s }),

  toggleSelect: (id) => {
    const prev = get().selectedUsers;
    set({
      selectedUsers: prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id],
    });
  },

  toggleSelectAll: () => {
    const { users, selectedUsers } = get();
    set({
      selectedUsers:
        selectedUsers.length === users.length
          ? []
          : users.map((u) => u.user_id),
    });
  },

  clearSelection: () => set({ selectedUsers: [] }),

  setAddOpen: (b) => set({ addOpen: b }),
  setEditingUser: (u) => set({ editingUser: u }),

  triggerRefresh: () => set((s) => ({ refreshKey: s.refreshKey + 1 })), // ✅ thêm hàm này

  fetchUsers: async () => {
    const { page, pageSize, search, sortBy, sortOrder, sortField, roleFilters } =
      get();
    set({ loading: true });
    try {
      const res = await axios.get("/api/user_account", {
        params: {
          page,
          page_size: pageSize,
          search,
          sort_by: sortBy,
          sort_order: sortOrder,
          sort: sortField,
          filter: roleFilters.join(",") || undefined,
          t: Date.now(), // tránh cache
        },
      });
      set({
        users: res.data.items,
        total: res.data.total,
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },
}));
