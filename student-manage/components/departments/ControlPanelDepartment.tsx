"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/shared/SearchBar";
import { useDepartmentStore } from "@/store/useDepartmentStore";
import { useEffect } from "react";

interface ControlPanelDepartmentProps {
  total: number;
  addLabel: string;
  addTotal: string;
  onAdd: () => void;
}

export default function ControlPanelDepartment({
  total,
  addLabel,
  addTotal,
  onAdd,
}: ControlPanelDepartmentProps) {
  const {
    search,
    pageSize,
    sortBy,
    sortOrder,
    setSearch,
    setPage,
    setPageSize,
    setSortBy,
    setSortOrder,
  } = useDepartmentStore();

  useEffect(() => {
    setPage(1); // reset page khi thay đổi sort hoặc search
  }, [search, sortBy, sortOrder]);

  return (
    <div className="p-4 mb-6 bg-gray-50 border rounded-lg shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-6">
        {/* ➕ Add button */}
        <div className="flex flex-col">
          <Label className="mb-1 text-sm font-medium invisible">Add</Label>
          <Button onClick={onAdd} className="whitespace-nowrap">
            {addLabel}
          </Button>
        </div>

        {/* 🔢 Hiển thị
 */}
        <div className="flex flex-col">
          <Label htmlFor="pageSize" className="mb-1 text-sm font-medium">
            Hiển thị
          </Label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="border rounded-md px-3 py-2 text-sm bg-white shadow-sm"
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        {/* 🔽 Sorting */}
        <div className="flex flex-col">
          <Label className="mb-1 text-sm font-medium">Sắp xếp</Label>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="border rounded-md px-3 py-2 text-sm bg-white shadow-sm"
            >
              {/* <option value="" disabled>Chọn trường</option> */}
              <option value="department_id">ID Khoa</option>
              <option value="department_code">Mã Khoa</option>
              <option value="department_name">Tên khoa</option>
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
        </div>

        {/* 🔎 Search */}
        <div className="flex flex-col flex-1 max-w-xs ml-auto">
          <SearchBar search={search} onChange={setSearch} onClear={() => setSearch("")} />
          <span className="mt-1 text-xs text-gray-600 text-right">
            {addTotal}: <span className="font-semibold">{total}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
