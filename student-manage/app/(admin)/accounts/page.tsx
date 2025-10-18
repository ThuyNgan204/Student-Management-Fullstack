// app/(...) path: the page component you provided — replace with this content
"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Trash2, RefreshCw } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import DataTable, { Column } from "@/components/shared/DataTable";
import Pagination from "@/components/shared/Pagination";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import UserControlPanel from "@/components/accounts/UserControlPanel";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import { useUserStore, UserAccount } from "@/store/useUserStore";
import { useCRUD } from "@/hooks/useCRUD";
import { useDebounce } from "@/hooks/useDebounce";
import { UserAccountFormInputs, userAccountSchema } from "@/lib/zodSchemas";

type AvailableUser = {
  type: "student" | "lecturer";
  id: number;
  code: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
};

export default function UserAccountPage() {
  const {
    page,
    pageSize,
    search,
    sortField,
    sortBy,
    sortOrder,
    addOpen,
    // editingUser, -- we will not use edit
    selectedUsers,
    roleFilters,
    setPage,
    setSearch,
    setSortField,
    setAddOpen,
    // setEditingUser,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
  } = useUserStore();

  const debouncedSearch = useDebounce(search, 500);
  const headerCheckboxRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sortBy, sortOrder, roleFilters, setPage]);

  // ✅ CRUD hook
  const {
    data,
    isLoading,
    addMutation,
    updateMutation,
    deleteMutation,
    refetch,
  } = useCRUD<UserAccount, UserAccountFormInputs>({
    resource: "user_account",
    idField: "user_id",
    page,
    pageSize,
    search: debouncedSearch,
    sortBy,
    sortOrder,
    filters: {
      role: roleFilters,
    },
  });

  // Fetch available users for Add dialog
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get("/api/user_account/available-users");
        setAvailableUsers(res.data || []);
      } catch (err) {
        console.error("Failed to load available users", err);
      }
    };
    if (addOpen) load();
  }, [addOpen]);

  // Form add: only choose a user
  const formAdd = useForm<{ selected_user: string }>({
    defaultValues: { selected_user: "" },
  });

  // Submit add
  const onSubmitAdd = async (values: { selected_user?: string }) => {
    if (!values.selected_user) return toast.error("Vui lòng chọn người dùng");

    // expected selected_user string format: `${type}:${id}` e.g. student:123
    const [type, idStr] = (values.selected_user || "").split(":");
    const id = Number(idStr);
    const found = availableUsers.find((u) => u.type === type && u.id === id);

    if (!found) return toast.error("Người dùng không hợp lệ");

    const payload: any = {
      selected_user: { type, id },
      is_active: true,
    };

    addMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Thêm người dùng thành công");
        formAdd.reset();
        setAvailableUsers((prev) => prev.filter((u) => !(u.type === type && u.id === id)));
        setAddOpen(false);
        refetch?.();
      },
      onError: (e: any) => {
        console.error(e);
        toast.error("Thêm thất bại");
      },
    });
  };

  // Delete user
  const handleDelete = (user_id: number) => {
    deleteMutation.mutate(user_id, {
      onSuccess: () => {
        toast.success("Xóa thành công");
        refetch?.();
      },
      onError: () => toast.error("Xóa thất bại"),
    });
  };

  // Reset password
  const handleResetPassword = async (user_id: number) => {
    try {
      await axios.patch(`/api/user_account/${user_id}/reset-password`);
      toast.success("Reset mật khẩu thành công");
    } catch (err) {
      console.error(err);
      toast.error("Reset mật khẩu thất bại");
    }
  };

  // Toggle status
  const handleToggleStatus = async (user_id: number) => {
    try {
      await axios.patch(`/api/user_account/${user_id}/toggle-status`);
      toast.success("Cập nhật trạng thái thành công");
      refetch?.();
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật trạng thái thất bại");
    }
  };

  const { items: users = [], total = 0 } = data ?? {};
  const totalPages = Math.ceil(total / pageSize);

  // Checkbox logic
  const isAllSelected = users.length > 0 && selectedUsers.length === users.length;
  const isSomeSelected = selectedUsers.length > 0 && selectedUsers.length < users.length;
  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = isSomeSelected;
    }
  }, [isSomeSelected]);

  // Columns
  const columns: Column<UserAccount>[] = [
    {
      key: "select",
      header: (
        <Checkbox
          ref={headerCheckboxRef as any}
          checked={isAllSelected}
          onCheckedChange={toggleSelectAll}
        />
      ),
      render: (u: UserAccount) => (
        <Checkbox
          checked={selectedUsers.includes(u.user_id)}
          onCheckedChange={() => toggleSelect(u.user_id)}
        />
      ),
      className: "w-12 text-left",
    },
    { key: "user_id", header: "ID", className: "w-16" },
    { key: "username", header: "Tên đăng nhập" },
    { 
      key: "full_name", 
      header: "Thông tin tài khoản", 
      render: (u: UserAccount) => { 
        const info = u.students ?? u.lecturers; if (!info) return "-"; 
        const code = u.students?.student_code ?? u.lecturers?.lecturer_code ?? "-";

        return ( 
        <div> 
          <div>{info.last_name} {info.first_name}</div> 
          <div className="text-gray-500 text-sm">{code}</div> 
          <div className="text-gray-500 text-sm">{info.phone}</div> 
          <div className="text-gray-500 text-sm">{info.email}</div> 
        </div> 
        ); }, } as Column<UserAccount>,
    {
      key: "role",
      header: "Vai trò",
      render: (u: UserAccount) => {
        if (!u.role) return "-";
        if (u.role === "student") return "Sinh viên";
        if (u.role === "lecturer") return "Giảng viên";
        if (u.role === "admin") return "Admin";
        return u.role;
      }
    },
    {
      key: "is_active",
      header: "Trạng thái",
      className: "text-center",
      render: (u: UserAccount) => (
        <div className="flex justify-center"> 
        <button
          onClick={() => handleToggleStatus(u.user_id)}
          className={`relative flex items-center w-[105px] h-8 rounded-full transition-colors duration-300 ${
            u.is_active ? "bg-green-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
              u.is_active ? "translate-x-[72px]" : "translate-x-0"
            }`}
          ></span>
          <span className="absolute w-full text-xs font-medium text-center text-white">
            {u.is_active ? "Active" : "Inactive"}
          </span>
        </button>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      className: "text-center",
      render: (u: UserAccount) => (
        <div className="flex gap-2 justify-center">
          <button  
             className="text-blue-400 hover:text-blue-800 cursor-pointer transition-colors"
            onClick={() => handleResetPassword(u.user_id)}>
            <RefreshCw className="size-4" />
          </button>

          <ConfirmDialog
            onConfirm={() => handleDelete(u.user_id)}
            title="Xóa tài khoản?"
            description="Tài khoản sẽ bị xóa vĩnh viễn và không thể hoàn tác."
            trigger={
              <button
                className="text-red-600 hover:text-red-900"
              >
                <Trash2 size={16} />
              </button>
            }
            />
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* FILTER */}
      <UserControlPanel
        total={total}
        onAdd={() => setAddOpen(true)}
      />

      <main className="flex-1 overflow-x-auto px-6 py-4">
        {isLoading ? (
          <p>Đang tải...</p>
        ) : (
          <>
            <DataTable columns={columns} data={users} emptyMessage="Không có người dùng" />
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </main>

      {/* ADD DIALOG */}
      <Dialog open={addOpen} onOpenChange={(o) => setAddOpen(o)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Thêm người dùng</DialogTitle>
          </DialogHeader>

          <form onSubmit={formAdd.handleSubmit(onSubmitAdd)} className="space-y-3">
            <div>
              <Label className="mb-2">Chọn Sinh viên / Giảng viên chưa có tài khoản</Label>
              <select
                {...formAdd.register("selected_user")}
                className="border rounded w-full px-2 py-1"
                defaultValue=""
              >
                <option value="" disabled>-- Chọn --</option>
                {availableUsers.map((u) => (
                  <option key={`${u.type}:${u.id}`} value={`${u.type}:${u.id}`}>
                    {u.type === "student" ? "SV" : "GV"} — {u.last_name} {u.first_name} ({u.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="text-sm text-gray-600">
              Sau khi chọn, hệ thống sẽ tự tạo <strong>username</strong> và <strong>password</strong> = MSSV / Mã GV.
            </div>

            <DialogFooter className="flex justify-end space-x-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  formAdd.reset();
                  setAddOpen(false);
                }}
              >
                Đóng
              </Button>
              <Button type="submit">Lưu</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
