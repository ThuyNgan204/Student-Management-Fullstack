"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import DataTable, { Column } from "@/components/shared/DataTable";
import Pagination from "@/components/shared/Pagination";
import { Pencil, Trash2, RefreshCw } from "lucide-react";
import UserControlPanel from "@/components/accounts/UserControlPanel";
import UserForm from "@/components/accounts/UserForm";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

export interface UserAccount {
  user_id: number;
  username: string;
  role: string;
  is_active: boolean;
  students?: { student_code: string; first_name: string; last_name: string; phone: string; email: string } | null;
  lecturers?: { lecturer_code: string; first_name: string; last_name: string; phone: string; email: string } | null;
}

export default function UserAccountPage() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  const headerCheckboxRef = useRef<HTMLInputElement | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/user_account", {
        params: { page, pageSize, search },
      });
      setUsers(res.data.items);
      setTotal(res.data.total);
    } catch (err) {
      toast.error("Lấy danh sách người dùng thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  // keep original handlers (logic preserved)
  const handleDelete = async (user_id: number) => {
    try {
      await axios.delete(`/api/user_account/${user_id}`);
      toast.success("Xóa người dùng thành công");
      fetchUsers();
    } catch {
      toast.error("Xóa thất bại");
    }
  };

  const handleBulkAction = async (action: "delete" | "activate" | "deactivate" | "reset") => {
    if (!selectedUsers.length) return toast.error("Chưa chọn người dùng");
    try {
      if (action === "delete") {
        await Promise.all(selectedUsers.map((id) => axios.delete(`/api/user_account/${id}`)));
        toast.success("Xóa thành công");
      } else if (action === "reset") {
        await Promise.all(selectedUsers.map((id) => axios.post(`/api/user_account/${id}/reset-password`)));
        toast.success("Reset mật khẩu thành công");
      } else {
        const is_active = action === "activate";
        await Promise.all(
          selectedUsers.map((id) => axios.patch(`/api/user_account/${id}`, { is_active }))
        );
        toast.success("Cập nhật trạng thái thành công");
      }
      fetchUsers();
      setSelectedUsers([]);
    } catch {
      toast.error("Thao tác thất bại");
    }
  };

  const handleAddOrUpdate = async (data: any) => {
    try {
      if (editingUser) {
        await axios.put(`/api/user_account/${editingUser.user_id}`, data);
        toast.success("Cập nhật người dùng thành công");
        setEditingUser(null);
      } else {
        await axios.post(`/api/user_account`, data);
        toast.success("Thêm người dùng thành công");
      }
      setAddOpen(false);
      fetchUsers();
    } catch {
      toast.error("Thao tác thất bại");
    }
  };

  // Checkbox helpers
  const isAllSelected = users.length > 0 && selectedUsers.length === users.length;
  const isSomeSelected = selectedUsers.length > 0 && selectedUsers.length < users.length;

  useEffect(() => {
    // set indeterminate property on the header checkbox DOM node
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = isSomeSelected;
    }
  }, [isSomeSelected]);

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((u) => u.user_id));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const totalPages = Math.ceil(total / pageSize);

  const columns: Column<UserAccount>[] = [
    {
      key: "select",
      header: (
        <Checkbox
          ref={headerCheckboxRef as any}
          checked={isAllSelected}
          onCheckedChange={toggleSelectAll}
          aria-label="Select all users"
        />
      ) as any,
      className: "w-12 text-left",
      render: (u: UserAccount) => (
        <div className="flex items-left justify-left">
          <Checkbox
            checked={selectedUsers.includes(u.user_id)}
            onCheckedChange={() => toggleSelectOne(u.user_id)}
            aria-label={`Select user ${u.user_id}`}
          />
        </div>
      ),
    },
    { key: "user_id", header: "ID", className: "w-16" } as Column<UserAccount>,
    { key: "username", header: "Username" } as Column<UserAccount>,
    {
      key: "full_name",
      header: "Thông tin tài khoản",
      render: (u: UserAccount) => {
        if (u.students) {
          return (
            <div>
              <div>{u.students.last_name} {u.students.first_name}</div>
              <div className="text-gray-500 text-sm">{u.students.student_code}</div>
              <div className="text-gray-500 text-sm">{u.students.phone}</div>
              <div className="text-gray-500 text-sm">{u.students.email}</div>
            </div>
          );
        }
        if (u.lecturers) {
          return (
            <div>
              <div>{u.lecturers.last_name} {u.lecturers.first_name}</div>
              <div className="text-gray-500 text-sm">{u.lecturers.lecturer_code}</div>
              <div className="text-gray-500 text-sm">{u.lecturers.phone}</div>
              <div className="text-gray-500 text-sm">{u.lecturers.email}</div>
            </div>
          );
        }
        return "-";
      },
    } as Column<UserAccount>,
    { key: "role", header: "Vai trò" } as Column<UserAccount>,
    {
      key: "is_active",
      header: "Trạng thái",
      render: (u: UserAccount) => (
        <Button
          size="sm"
          variant={u.is_active ? "default" : "outline"}
          // keep original logic (uses handleBulkAction) — we do not change it
          onClick={() =>
            handleBulkAction(u.is_active ? "deactivate" : "activate")
          }
        >
          {u.is_active ? "Active" : "Inactive"}
        </Button>
      ),
    } as Column<UserAccount>,
    {
      key: "actions",
      header: "Hành động",
      className: "text-center",
      render: (u: UserAccount) => (
        <div className="flex gap-2 justify-center">
          <Button variant="ghost" onClick={() => setEditingUser(u)}>
            <Pencil className="size-4" />
          </Button>
          <ConfirmDialog
            onConfirm={() => handleDelete(u.user_id)}
            title="Bạn chắc chắn?"
            description="Người dùng sẽ bị xóa vĩnh viễn"
          >
            <Button variant="ghost">
              <Trash2 className="size-4" />
            </Button>
          </ConfirmDialog>
          <Button
            variant="ghost"
            onClick={() =>
              // keep original logic (bulk reset) — we do not change it
              handleBulkAction("reset")
            }
          >
            <RefreshCw className="size-4" />
          </Button>
        </div>
      ),
    } as Column<UserAccount>,
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <UserControlPanel
        total={total}
        onAdd={() => setAddOpen(true)}
        onBulkAction={handleBulkAction}
        search={search}
        setSearch={setSearch}
      />

      <main className="flex-1 overflow-x-auto px-6 py-4">
        <div className="overflow-x-auto mt-4 bg-white shadow rounded">
          {loading ? (
            <p className="p-4">Đang tải...</p>
          ) : (
            <>
              <DataTable
                data={users}
                columns={columns}
                emptyMessage="Không có người dùng"
              />

              <div className="px-4 py-3">
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              </div>
            </>
          )}
        </div>
      </main>

      {(addOpen || editingUser) && (
        <UserForm
          open={addOpen || !!editingUser}
          onClose={() => {
            setAddOpen(false);
            setEditingUser(null);
          }}
          initialData={editingUser ?? undefined}
          onSubmit={handleAddOrUpdate}
        />
      )}
    </div>
  );
}
