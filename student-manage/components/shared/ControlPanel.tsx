"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useStudentStore } from "@/store/useStudentStore";
import SearchBar from "./SearchBar";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

interface ControlPanelProps {
  total: number;
  addLabel: string;
  addTotal: string;
  onAdd: () => void;
}

export default function ControlPanel({
  total,
  addLabel,
  addTotal,
  onAdd,
}: ControlPanelProps) {
  const {
    search,
    pageSize,
    sortBy,
    sortOrder,
    genderFilters,
    classFilters,
    majorFilters,
    openFilter,
    setSearch,
    setPage,
    setPageSize,
    setSortBy,
    setSortOrder,
    setGenderFilters,
    setClassFilters,
    setMajorFilters,
    setOpenFilter,
  } = useStudentStore();

  const [majors, setMajors] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);

  const filterRef = useRef<HTMLDivElement | null>(null);

  // 🔹 Fetch majors & classes
  useEffect(() => {
    axios.get("/api/majors").then((r) => setMajors(r.data)).catch(() => setMajors([]));
    axios.get("/api/academic_class").then((r) => setClasses(r.data.items)).catch(() => setClasses([]));
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

        {/* Sorting */}
        <div className="flex flex-col">
          <Label className="mb-1 text-sm font-medium">Sắp xếp</Label>
          <div className="flex gap-2">
            {/* Field select */}
            <select
              value={sortBy}
              onChange={(e) => {
                const newField = e.target.value;
                setSortBy(newField);
                setPage(1);
                // Không gọi fetch trực tiếp ở đây — parent sẽ refetch dựa vào sortBy/sortOrder/page
              }}
              className="border rounded-md px-3 py-2 text-sm bg-white shadow-sm"
            >
              {/* <option value="" disabled>Chọn trường</option> */}
              <option value="student_id">ID sinh viên</option>
              <option value="first_name">Tên sinh viên</option>
              <option value="student_code">MSSV</option>
            </select>

            {/* Order select */}
            <select
              value={sortOrder}
              onChange={(e) => {
                const newOrder = e.target.value as "asc" | "desc";
                setSortOrder(newOrder);
                setPage(1);
                // Không gọi fetch trực tiếp ở đây; parent sẽ refetch nếu sortBy đã có giá trị
              }}
              className="border rounded-md px-3 py-2 text-sm bg-white shadow-sm"
            >
              <option value="asc">ASC</option>
              <option value="desc">DESC</option>
            </select>
          </div>
        </div>

        {/* 🔍 Filters dropdown */}
        <div className="relative inline-block text-left" ref={filterRef}>
          <Label className="mb-1 text-sm font-medium">Bộ lọc</Label>
          <button
            onClick={() => setOpenFilter(!openFilter)}
            className="w-40 border rounded-md px-3 py-2 text-sm bg-white shadow-sm flex items-center justify-between hover:bg-gray-50"
          >
            Chọn bộ lọc
            {genderFilters.length + classFilters.length + majorFilters.length > 0 && (
              <span className="ml-1 text-blue-600 font-semibold">
                ({genderFilters.length + classFilters.length + majorFilters.length})
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
            <div className="absolute left-0 mt-2 w-100 rounded-lg shadow-lg bg-white border z-20 p-6 space-y-6 text-sm">
              {/* Gender */}
              <div>
                <p className="font-medium text-base mb-3">Giới tính</p>
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

              {/* Class filter */}
              <div>
                <p className="font-medium text-base mb-3">Lớp sinh hoạt</p>
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                  {classes.map((cls) => (
                    <label key={cls.class_code} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        value={cls.class_code}
                        checked={classFilters.includes(cls.class_code)}
                        onChange={(e) =>
                          setClassFilters((prev) =>
                            e.target.checked ? [...prev, cls.class_code] : prev.filter((x) => x !== cls.class_code)
                          )
                        }
                      />
                      {cls.class_code}
                    </label>
                  ))}
                </div>
              </div>

              {/* Major filter */}
              <div>
                <p className="font-medium text-base mb-3">Chuyên ngành</p>
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                  {majors.map((dept) => (
                    <label key={dept.major_code} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        value={dept.major_code}
                        checked={majorFilters.includes(dept.major_code)}
                        onChange={(e) =>
                          setMajorFilters((prev) =>
                            e.target.checked ? [...prev, dept.major_code] : prev.filter((x) => x !== dept.major_code)
                          )
                        }
                      />
                      {dept.major_code}
                    </label>
                  ))}
                </div>
              </div>

              {/* Reset */}
              <button
                onClick={() => {
                  setGenderFilters([]);
                  setClassFilters([]);
                  setMajorFilters([]);
                  setOpenFilter(false);
                }}
                className="w-full px-3 py-2 text-base rounded-md bg-gray-100 hover:bg-gray-200 mt-2"
              >
                Thiết lập lại
              </button>
            </div>
          )}
        </div>

        {/* 🔎 Search + total */}
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
