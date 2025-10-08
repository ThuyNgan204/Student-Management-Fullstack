"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useClassStore } from "@/store/useClassStore";
import SearchBar from "@/components/shared/SearchBar";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

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
      axios.get("/api/departments"),
      axios.get("/api/majors"),
    ])
      .then(([deptRes, majorRes]) => {
        setDepartments(deptRes.data);
        setMajors(majorRes.data);
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
              <option value="academic_class_id">Class ID</option>
              <option value="class_code">Class Code</option>
              <option value="class_name">Class Name</option>
              <option value="cohort">Cohort</option>
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
            <div className="absolute left-0 mt-2 w-96 rounded-lg shadow-lg bg-white border z-20 p-6 space-y-6 text-sm">
              {/* Cohort Filter */}
              <div>
                <p className="font-medium text-base mb-3">Cohort</p>
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

              {/* Major Filter */}
              <div>
                <p className="font-medium text-base mb-3">Major</p>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {majors.map((m) => (
                    <label key={m.major_code} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        value={m.major_code}
                        checked={majorFilters.includes(m.major_code)}
                        onChange={(e) =>
                          setMajorFilters((prev) =>
                            e.target.checked
                              ? [...prev, m.major_code]
                              : prev.filter((x) => x !== m.major_code)
                          )
                        }
                      />
                      {m.major_code}
                    </label>
                  ))}
                </div>
              </div>

              {/* Reset Button */}
              <button
                onClick={() => {
                  setCohortFilters([]);
                  setDepartmentFilters([]);
                  setMajorFilters([]);
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
