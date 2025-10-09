"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/shared/SearchBar";
import { useEffect, useRef, useState } from "react";
import { useCourseStore } from "@/store/useCourseStore";
import axios from "axios";

interface ControlPanelCourseProps {
  total: number;
  addLabel: string;
  addTotal: string;
  onAdd: () => void;
}

export default function ControlPanelCourse({
  total,
  addLabel,
  addTotal,
  onAdd,
}: ControlPanelCourseProps) {
  const {
    search,
    pageSize,
    sortBy,
    sortOrder,
    departmentFilters,
    openFilter,
    setSearch,
    setPage,
    setPageSize,
    setSortBy,
    setSortOrder,
    setDepartmentFilters,
    setOpenFilter,
  } = useCourseStore();

  const [departments, setDepartments] = useState<any[]>([]);
  const filterRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    axios
      .get("/api/departments")
      .then((res) => setDepartments(res.data.items))
      .catch(() => setDepartments([]));
  }, []);

  useEffect(() => setPage(1), [search, sortBy, sortOrder]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setOpenFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setOpenFilter]);

  return (
    <div className="p-4 mb-6 bg-gray-50 border rounded-lg shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col">
          <Button onClick={onAdd}>{addLabel}</Button>
        </div>

        <div className="flex flex-col">
          <Label htmlFor="pageSize" className="mb-1 text-sm font-medium">Hiển thị</Label>
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
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <Label className="mb-1 text-sm font-medium">Sắp xếp</Label>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="border rounded-md px-3 py-2 text-sm bg-white shadow-sm"
            >
              <option value="course_id">ID Môn học</option>
              <option value="course_code">Mã môn</option>
              <option value="course_name">Tên môn</option>
              <option value="credits">Số tín chỉ</option>
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

        <div className="relative inline-block text-left" ref={filterRef}>
          <Label className="mb-1 text-sm font-medium">Bộ lọc</Label>
          <button
            onClick={() => setOpenFilter(!openFilter)}
            className="w-40 border rounded-md px-3 py-2 text-sm bg-white shadow-sm flex items-center justify-between hover:bg-gray-50"
          >
            Chọn khoa
            {departmentFilters.length > 0 && (
              <span className="ml-1 text-blue-600 font-semibold">
                ({departmentFilters.length})
              </span>
            )}
            <svg className={`w-4 h-4 text-gray-500 ml-2 transform ${openFilter ? "rotate-180" : "rotate-0"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {openFilter && (
            <div className="absolute left-0 mt-2 w-80 rounded-lg shadow-lg bg-white border z-20 p-4 space-y-4 text-sm">
                <p className="font-medium text-base mb-2">Khoa</p>
                <div className="max-h-48 overflow-y-auto">
                {departments.map((dept) => (
                    <label key={dept.department_id} className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        value={dept.department_id} // ✅ dùng id làm value
                        checked={departmentFilters.includes(String(dept.department_id))} // ✅ so sánh theo id (chuỗi)
                        onChange={(e) =>
                        setDepartmentFilters((prev) =>
                            e.target.checked
                            ? [...prev, e.target.value]
                            : prev.filter((x) => x !== e.target.value)
                        )
                        }
                    />
                    {dept.department_name} {/* ✅ hiển thị tên khoa */}
                    </label>
                ))}
                </div>
              <button
                onClick={() => { setDepartmentFilters([]); setOpenFilter(false); }}
                className="w-full px-3 py-2 text-base rounded-md bg-gray-100 hover:bg-gray-200 mt-2"
              >
                Thiết lập lại
              </button>
            </div>
          )}
        </div>

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
