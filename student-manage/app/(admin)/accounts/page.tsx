"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/shared/DataTable";
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
  student?: { student_code: string; first_name: string; last_name: string } | null;
  lecturer?: { lecturer_code: string; first_name: string; last_name: string } | null;
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

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <UserControlPanel
        total={total}
        onAdd={() => setAddOpen(true)}
        onBulkAction={handleBulkAction}
        search={search}
        setSearch={setSearch}
      />

      <div className="overflow-x-auto mt-4 bg-white shadow rounded">
        {loading ? (
          <p className="p-4">Đang tải...</p>
        ) : (
          <DataTable
            data={users}
            rowSelection={{ selected: selectedUsers, setSelected: setSelectedUsers }}
            columns={[
              { key: "user_id", header: "ID" },
              { key: "username", header: "Username" },
              {
                key: "full_name",
                header: "Họ & Tên",
                render: (u) =>
                  u.student
                    ? `${u.student.last_name} ${u.student.first_name}`
                    : u.lecturer
                    ? `${u.lecturer.last_name} ${u.lecturer.first_name}`
                    : "-",
              },
              { key: "role", header: "Vai trò" },
              {
                key: "is_active",
                header: "Trạng thái",
                render: (u) => (
                  <Button
                    size="sm"
                    variant={u.is_active ? "default" : "outline"}
                    onClick={() =>
                      handleBulkAction(u.is_active ? "deactivate" : "activate")
                    }
                  >
                    {u.is_active ? "Active" : "Inactive"}
                  </Button>
                ),
              },
              {
                key: "actions",
                header: "Hành động",
                className: "text-center",
                render: (u) => (
                  <div className="flex gap-2 justify-center">
                    <Button size="sm" onClick={() => setEditingUser(u)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <ConfirmDialog
                      onConfirm={() => handleDelete(u.user_id)}
                      title="Bạn chắc chắn?"
                      description="Người dùng sẽ bị xóa vĩnh viễn"
                    >
                      <Button size="sm" variant="destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </ConfirmDialog>
                    <Button
                      size="sm"
                      onClick={() =>
                        handleBulkAction("reset")
                      }
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                ),
              },
            ]}
            emptyMessage="Không có người dùng"
          />
        )}
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

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
