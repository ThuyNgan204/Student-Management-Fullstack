"use client";

import SearchBar from "@/components/shared/SearchBar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useClassStore } from "@/store/useClassStore";
import axios from "axios";
import { useEffect, useRef, useState } from "react";

interface ControlPanelClassProps {
  total: number;
  addLabel: string;
  addTotal: string;
  onAdd: () => void;
}

export default function ControlPanelClass({
  total,
  addLabel,
  addTotal,
  onAdd,
}: ControlPanelClassProps) {
  const {
    search,
    pageSize,
    sortBy,
    sortOrder,
    cohortFilters,
    departmentFilters,
    majorFilters,
    openFilter,
    setSearch,
    setPage,
    setPageSize,
    setSortBy,
    setSortOrder,
    setCohortFilters,
    setDepartmentFilters,
    setMajorFilters,
    setOpenFilter,
  } = useClassStore();

  const [departments, setDepartments] = useState<any[]>([]);
  const [majors, setMajors] = useState<any[]>([]);
  const filterRef = useRef<HTMLDivElement | null>(null);

  // 🔹 Fetch departments & majors
  useEffect(() => {
    Promise.all([
      axios.get("/api/departments", { params: { page: 1, page_size: 100 } }),
      axios.get("/api/majors", { params: { page: 1, page_size: 100 } }),
    ])
      .then(([deptRes, majorRes]) => {
        setDepartments(deptRes.data.items);
        setMajors(majorRes.data.items);
      })
      .catch(() => {
        setDepartments([]);
        setMajors([]);
      });
  }, []);

  // 🔹 Tắt dropdown khi click ra ngoài
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
        {/* ➕ Add button */}
        <div className="flex flex-col">
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
              <option value="academic_class_id">ID lớp sinh hoạt</option>
              <option value="class_code">Mã lớp sinh hoạt</option>
              <option value="class_name">Tên lớp sinh hoạt</option>
              <option value="cohort">Khóa</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value as "asc" | "desc");
                setPage(1);
              }}
              className="border rounded-md px-3 py-2 text-sm bg-white shadow-sm"
            >
              <option value="asc">ASC</option>
              <option value="desc">DESC</option>
            </select>
          </div>
        </div>

        {/* 🎚 Filters */}
        <div className="relative inline-block text-left" ref={filterRef}>
          <Label className="mb-1 text-sm font-medium">Bộ lọc</Label>
          <button
            onClick={() => setOpenFilter(!openFilter)}
            className="w-40 border rounded-md px-3 py-2 text-sm bg-white shadow-sm flex items-center justify-between hover:bg-gray-50"
          >
            Chọn bộ lọc
            {(cohortFilters.length + departmentFilters.length + majorFilters.length) > 0 && (
              <span className="ml-1 text-blue-600 font-semibold">
                ({cohortFilters.length + departmentFilters.length + majorFilters.length})
              </span>
            )}
            <svg
              className={`w-4 h-4 text-gray-500 ml-2 transform ${openFilter ? "rotate-180" : "rotate-0"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {openFilter && (
            <div className="absolute left-0 mt-2 w-96 rounded-lg shadow-lg bg-white border z-20 p-6 text-sm">

              {/* Vùng scroll cho filter */}
              <div className="space-y-6 max-h-[420px] overflow-y-auto pr-2">

                {/* Cohort Filter
                <div>
                  <p className="font-medium text-base mb-3">Khóa</p>
                  <div className="grid grid-cols-3 gap-2">
                    {["K44", "K45", "K46", "K47", "K48"].map((c) => (
                      <label key={c} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          value={c}
                          checked={cohortFilters.includes(c)}
                          onChange={(e) =>
                            setCohortFilters((prev) =>
                              e.target.checked ? [...prev, c] : prev.filter((x) => x !== c)
                            )
                          }
                        />
                        {c}
                      </label>
                    ))}
                  </div>
                </div> */}

                {/* Department Filter */}
                <div>
                  <p className="font-medium text-base mb-3">Khoa</p>
                  <div className="grid grid-cols-3 gap-2">
                    {departments.map((dept) => (
                      <label key={dept.department_id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          value={dept.department_id}
                          checked={departmentFilters.includes(dept.department_id)}
                          onChange={(e) =>
                            setDepartmentFilters((prev) =>
                              e.target.checked
                                ? [...prev, dept.department_id]
                                : prev.filter((x) => x !== dept.department_id)
                            )
                          }
                        />
                        {dept.department_code}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Major Filter */}
                <div>
                  <p className="font-medium text-base mb-3">Chuyên ngành</p>
                  <div className="grid grid-cols-3 gap-2">
                    {majors.map((m) => (
                      <label key={m.major_id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          value={m.major_id}
                          checked={majorFilters.includes(m.major_id)}
                          onChange={(e) =>
                            setMajorFilters((prev) =>
                              e.target.checked
                                ? [...prev, m.major_id]
                                : prev.filter((x) => x !== m.major_id)
                            )
                          }
                        />
                        {m.major_code}
                      </label>
                    ))}
                  </div>
                </div>

              </div>

              {/* Nút reset — CỐ ĐỊNH KHÔNG CUỘN */}
              <button
                onClick={() => {
                  setCohortFilters([]);
                  setDepartmentFilters([]);
                  setMajorFilters([]);
                  setOpenFilter(false);
                }}
                className="w-full px-3 py-2 text-base rounded-md bg-gray-100 hover:bg-gray-200 mt-4"
              >
                Thiết lập lại
              </button>

            </div>
          )}

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
