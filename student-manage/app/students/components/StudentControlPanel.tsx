"use client";

import React from "react";
import { useStudentStore } from "@/store/useStudentStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type StudentControlPanelProps = {
  totalStudents: number;
};

export default function StudentControlPanel({
  totalStudents,
}: StudentControlPanelProps) {
  const {
    pageSize,
    search,
    openFilter,
    genderFilters,
    classFilters,
    sortBy,
    sortOrder,
    setPage,
    setPageSize,
    setSearch,
    setOpenFilter,
    setGenderFilters,
    setClassFilters,
    setSortBy,
    setSortOrder,
    setAddOpen, // <-- Thêm hàm này từ store
  } = useStudentStore();

  return (
    <div className="p-6 border-b border-gray-300 bg-gray-50">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Nút Add Student */}
        <Button onClick={() => setAddOpen(true)}>Add Student</Button>

        {/* Thanh tìm kiếm */}
        <div className="relative w-full md:w-80">
          <Input
            placeholder="Search student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              X
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-6 mt-6">
        {/* Số hàng mỗi trang */}
        <div className="flex flex-col">
          <Label htmlFor="pageSize" className="mb-1 text-sm font-medium text-gray-700">
            Rows per page
          </Label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="border rounded-md px-3 py-2 text-sm bg-white shadow-sm focus:ring-1 focus:ring-black-300"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        {/* Sắp xếp */}
        <div className="flex flex-col">
          <Label className="mb-1 text-sm font-medium text-gray-700">Sort</Label>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="border rounded-md px-3 py-2 text-sm bg-white shadow-sm focus:ring-1 focus:ring-black-300"
            >
              <option value="">Field</option>
              <option value="id">ID</option>
              <option value="first_name">Name</option>
              <option value="class_name">Class</option>
              <option value="dob">Date of Birth</option>
              <option value="created_at">Created At</option>
              <option value="updated_at">Updated At</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value as "asc" | "desc");
                setPage(1);
              }}
              className="border rounded-md px-3 py-2 text-sm bg-white shadow-sm focus:ring-1 focus:ring-black-300"
            >
              <option value="desc">DESC</option>
              <option value="asc">ASC</option>
            </select>
          </div>
        </div>

        {/* Bộ lọc */}
        <div className="relative inline-block text-left">
          <Label className="mb-1 text-sm font-medium text-gray-700">Filters</Label>
          <button
            onClick={() => setOpenFilter(!openFilter)}
            className="w-40 border rounded-md px-3 py-2 text-sm bg-white shadow-sm flex items-center justify-between hover:bg-gray-50"
          >
            Select filters
            {genderFilters.length + classFilters.length > 0 && (
              <span className="ml-1 text-blue-600 font-semibold">
                ({genderFilters.length + classFilters.length})
              </span>
            )}
            <svg
              className={`w-4 h-4 text-gray-500 ml-2 transform ${
                openFilter ? "rotate-180" : "rotate-0"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {openFilter && (
            <div className="absolute left-0 mt-2 w-44 rounded-lg shadow-lg bg-white border z-10 p-4 space-y-4">
              <div>
                <p className="font-medium text-sm mb-2">Gender</p>
                <div className="flex flex-col gap-1">
                  {["Male", "Female"].map((g) => (
                    <label key={g} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        value={g}
                        checked={genderFilters.includes(g)}
                        onChange={(e) =>
                          setGenderFilters((prev) =>
                            e.target.checked
                              ? [...prev, g]
                              : prev.filter((x) => x !== g)
                          )
                        }
                      />
                      {g}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-medium text-sm mb-2">Class</p>
                <div className="flex flex-col gap-1">
                  {["10", "11", "12"].map((c) => (
                    <label key={c} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        value={c}
                        checked={classFilters.includes(c)}
                        onChange={(e) =>
                          setClassFilters((prev) =>
                            e.target.checked
                              ? [...prev, c]
                              : prev.filter((x) => x !== c)
                          )
                        }
                      />
                      {c}
                    </label>
                  ))}
                </div>
              </div>
              <div className="pt-2 border-t">
                <button
                  onClick={() => {
                    setGenderFilters([]);
                    setClassFilters([]);
                  }}
                  className="w-full px-3 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tổng số sinh viên */}
        <div className="ml-auto text-gray-700 text-sm">
          <span className="font-medium">Total students:</span>{" "}
          <span className="font-semibold">{totalStudents}</span>
        </div>
      </div>
    </div>
  );
}