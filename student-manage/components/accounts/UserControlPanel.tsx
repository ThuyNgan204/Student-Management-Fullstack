"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/shared/SearchBar";
import { Trash2 } from "lucide-react";
import { Label } from "@radix-ui/react-label";
import axios from "axios";
import { toast } from "sonner";
import { useUserStore } from "@/store/useUserStore";
import { useCRUD } from "@/hooks/useCRUD";
import ConfirmDialog from "../shared/ConfirmDialog";

interface Props {
  total: number;
  onAdd: () => void;
}

export default function UserControlPanel({ total, onAdd }: Props) {
  const filterRef = useRef<HTMLDivElement | null>(null);
  const [openFilter, setOpenFilter] = useState(false);

  const {
    selectedUsers,
    page,
    search,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    setSearch,
    roleFilters,
    refreshKey,
    setRoleFilters,
    pageSize,
    setPageSize,
    setPage,
    setSortField,
    triggerRefresh,
    fetchUsers,
    clearSelection,
  } = useUserStore();

  const { bulkMutation } = useCRUD({
  resource: "user_account",
  page,
  pageSize,
  search,
  filters: {
    role: roleFilters,
  },
  sortBy,
  sortOrder
});


  const handleBulkAction = (action: "delete" | "activate" | "deactivate" | "reset-password") => {
  if (!selectedUsers.length) return;

  bulkMutation.mutate(
    { ids: selectedUsers, action },
    {
      onSuccess: () => {
        toast.success("Thực hiện thành công");
        clearSelection();
      },
      onError: () => toast.error("Thao tác thất bại")
    }
  );
};

  // Đóng mở menu lọc
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setOpenFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setRoleFilters(roleFilters);
  }, [roleFilters, setRoleFilters]);

  useEffect(() => {
    setSortField(`${sortBy}_${sortOrder}`);
  }, [sortBy, sortOrder, setSortField]);

  useEffect(() => {
    fetchUsers();
  }, [search, pageSize, sortBy, sortOrder, roleFilters, refreshKey]);

  return (
    <div className="p-4 mb-6 bg-gray-50 border rounded-lg shadow-sm space-y-3">
      {/* HÀNG TRÊN */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Thêm / Import / Export */}
        <div className="flex gap-2">
          <Button onClick={onAdd}>Thêm tài khoản</Button>
        </div>

        {/* Hiển thị */}
        <div className="flex items-center gap-2">
          <Label className="mb-1 text-sm">Hiển thị</Label>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="border rounded-md px-3 py-2 text-sm bg-white shadow-sm"
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        {/* Sắp xếp */}
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm bg-white shadow-sm"
          >
            <option value="user_id">ID</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
            className="border rounded-md px-3 py-2 text-sm bg-white shadow-sm"
          >
            <option value="asc">ASC</option>
            <option value="desc">DESC</option>
          </select>
        </div>

        {/* Bộ lọc */}
        <div className="relative inline-block text-left" ref={filterRef}>
          <button
            onClick={() => setOpenFilter(!openFilter)}
            className="border rounded-md px-3 py-2 text-sm bg-white shadow-sm flex items-center justify-between hover:bg-gray-50 min-w-[130px]"
          >
            Bộ lọc
            {roleFilters.length > 0 && (
              <span className="ml-1 text-blue-600 font-semibold">({roleFilters.length})</span>
            )}
            <svg
              className={`w-4 h-4 ml-2 transform ${openFilter ? "rotate-180" : "rotate-0"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {openFilter && (
            <div className="absolute left-0 mt-2 w-60 rounded-lg shadow-lg bg-white border z-20 p-4 space-y-3 text-sm">
              <div className="flex flex-col gap-2">
                {[
                  { value: "admin", label: "Admin" },
                  { value: "lecturer", label: "Giảng viên" },
                  { value: "student", label: "Sinh viên" },
                ].map((role) => (
                  <label key={role.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      value={role.value}
                      checked={roleFilters.includes(role.value)}
                      onChange={(e) =>
                        setRoleFilters(
                          e.target.checked
                            ? [...roleFilters, role.value]
                            : roleFilters.filter((x) => x !== role.value)
                        )
                      }
                    />
                    {role.label}
                  </label>
                ))}
              </div>
              <button
                onClick={() => setRoleFilters([])}
                className="w-full px-3 py-2 text-base rounded-md bg-gray-100 hover:bg-gray-200 mt-2"
              >
                Thiết lập lại
              </button>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="flex items-center max-w-xs flex-1">
          <SearchBar search={search} onChange={setSearch} onClear={() => setSearch("")} />
        </div>
      </div>

      {/* HÀNG DƯỚI */}
      <div className="flex justify-between items-center">
        {/* ĐÃ CHỌN */}
        <div className="flex items-center text-xs text-gray-700">
          Đã chọn: <span className="font-semibold mx-1">{selectedUsers.length}</span> / {total}
          <ConfirmDialog
            onConfirm={() => handleBulkAction("delete")}
            title={`Xóa ${selectedUsers.length} tài khoản?`}
            description="Tài khoản sẽ bị xóa vĩnh viễn và không thể hoàn tác."
            trigger={
              <button
                disabled={!selectedUsers.length}
                className={`ml-2 p-1 ${selectedUsers.length ? "text-red-600" : "text-gray-400 cursor-not-allowed"}`}
              >
                <Trash2 size={16} />
              </button>
            }
          />
        </div>

        {/* BULK BUTTONS */}
        <div className="flex gap-2">
        <ConfirmDialog
          onConfirm={() => handleBulkAction("activate")}
          title={`Kích hoạt ${selectedUsers.length} tài khoản?`}
          description="Các tài khoản này sẽ được chuyển sang trạng thái hoạt động."
          trigger={
            <Button variant="secondary" disabled={!selectedUsers.length}>
              Kích hoạt
            </Button>
          }
        />

        <ConfirmDialog
          onConfirm={() => handleBulkAction("deactivate")}
          title={`Vô hiệu hóa ${selectedUsers.length} tài khoản?`}
          description="Các tài khoản này sẽ bị vô hiệu hóa và không thể đăng nhập."
          trigger={
            <Button variant="secondary" disabled={!selectedUsers.length}>
              Vô hiệu hóa
            </Button>
          }
        />

        <ConfirmDialog
          onConfirm={() => handleBulkAction("reset-password")}
          title={`Reset mật khẩu cho ${selectedUsers.length} tài khoản?`}
          description="Mật khẩu mới sẽ được gửi về email của người dùng."
          trigger={
            <Button variant="secondary" disabled={!selectedUsers.length}>
              Reset mật khẩu
            </Button>
          }
        />
      </div>
      </div>
    </div>
  );
}
