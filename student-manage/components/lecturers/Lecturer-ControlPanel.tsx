"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLecturerStore } from "@/store/useLecturerStore";
import SearchBar from "@/components/shared/SearchBar";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

interface ControlPanelLecturerProps {
  total: number;
  addLabel: string;
  addTotal: string;
  onAdd: () => void;
}

export default function ControlPanelLecturer({
  total,
  addLabel,
  addTotal,
  onAdd,
}: ControlPanelLecturerProps) {
  const {
    search,
    pageSize,
    sortBy,
    sortOrder,
    genderFilters,
    departmentFilters,
    positionFilters,
    openFilter,
    setSearch,
    setPage,
    setPageSize,
    setSortBy,
    setSortOrder,
    setGenderFilters,
    setDepartmentFilters,
    setPositionFilters,
    setOpenFilter,
  } = useLecturerStore();

  const [departments, setDepartments] = useState<any[]>([]);
  const filterRef = useRef<HTMLDivElement | null>(null);

  // 🔹 Fetch departments
  useEffect(() => {
    axios.get("/api/departments").then((r) => setDepartments(r.data)).catch(() => setDepartments([]));
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
          <Label className="mb-1 text-sm font-medium invisible">Add</Label>
          <Button onClick={onAdd} className="whitespace-nowrap">
            {addLabel}
          </Button>
        </div>

        {/* 🔢 Rows per page */}
        <div className="flex flex-col">
          <Label htmlFor="pageSize" className="mb-1 text-sm font-medium">
            Rows per page
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
          <Label className="mb-1 text-sm font-medium">Sort</Label>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="border rounded-md px-3 py-2 text-sm bg-white shadow-sm"
            >
              <option value="">Field</option>
              <option value="lecturer_id">Lecturer ID</option>
              <option value="lecturer_code">Lecturer Code</option>
              <option value="first_name">Lecturer Name</option>
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
          <Label className="mb-1 text-sm font-medium">Filters</Label>
          <button
            onClick={() => setOpenFilter(!openFilter)}
            className="w-40 border rounded-md px-3 py-2 text-sm bg-white shadow-sm flex items-center justify-between hover:bg-gray-50"
          >
            Select filters
            {(genderFilters.length + departmentFilters.length + positionFilters.length) > 0 && (
              <span className="ml-1 text-blue-600 font-semibold">
                ({genderFilters.length + departmentFilters.length + positionFilters.length})
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
            <div className="absolute left-0 mt-2 w-96 rounded-lg shadow-lg bg-white border z-20 p-6 space-y-6 text-sm">
              {/* Gender Filter */}
              <div>
                <p className="font-medium text-base mb-3">Gender</p>
                <div className="grid grid-cols-3 gap-2">
                  {["Nam", "Nữ", "Khác"].map((g) => (
                    <label key={g} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        value={g}
                        checked={genderFilters.includes(g)}
                        onChange={(e) =>
                          setGenderFilters((prev) =>
                            e.target.checked ? [...prev, g] : prev.filter((x) => x !== g)
                          )
                        }
                      />
                      {g}
                    </label>
                  ))}
                </div>
              </div>

              {/* Department Filter */}
              <div>
                <p className="font-medium text-base mb-3">Department</p>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {departments.map((dept) => (
                    <label key={dept.department_code} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        value={dept.department_code}
                        checked={departmentFilters.includes(dept.department_code)}
                        onChange={(e) =>
                          setDepartmentFilters((prev) =>
                            e.target.checked
                              ? [...prev, dept.department_code]
                              : prev.filter((x) => x !== dept.department_code)
                          )
                        }
                      />
                      {dept.department_code}
                    </label>
                  ))}
                </div>
              </div>

              {/* Position Filter */}
              <div>
                <p className="font-medium text-base mb-3">Position</p>
                <div className="grid grid-cols-3 gap-2">
                  {["Trợ giảng", "Giảng viên", "Trưởng khoa", "Phó khoa"].map((pos) => (
                    <label key={pos} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        value={pos}
                        checked={positionFilters.includes(pos)}
                        onChange={(e) =>
                          setPositionFilters((prev) =>
                            e.target.checked ? [...prev, pos] : prev.filter((x) => x !== pos)
                          )
                        }
                      />
                      {pos}
                    </label>
                  ))}
                </div>
              </div>

              {/* Reset Button */}
              <button
                onClick={() => {
                  setGenderFilters([]);
                  setDepartmentFilters([]);
                  setPositionFilters([]);
                  setOpenFilter(false);
                }}
                className="w-full px-3 py-2 text-base rounded-md bg-gray-100 hover:bg-gray-200 mt-2"
              >
                Reset
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
