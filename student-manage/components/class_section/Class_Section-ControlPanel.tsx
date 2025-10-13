"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useClassSectionStore } from "@/store/useClassSectionStore";
import { useEffect, useRef } from "react";
import SearchBar from "../shared/SearchBar";

interface ControlPanelClassSectionProps {
  total: number;
  addLabel: string;
  addTotal: string;
  onAdd: () => void;
}

export default function ControlPanelClassSection({
  total,
  addLabel,
  addTotal,
  onAdd,
}: ControlPanelClassSectionProps) {
  const {
    search,
    pageSize,
    sortBy,
    sortOrder,
    semesterFilters,
    openFilter,
    setSearch,
    setPage,
    setPageSize,
    setSortBy,
    setSortOrder,
    setSemesterFilters,
    setOpenFilter,
    fetchClassSections,
  } = useClassSectionStore();

  const filterRef = useRef<HTMLDivElement | null>(null);

  // Tự động fetch khi thay đổi filter/sort
  useEffect(() => {
    fetchClassSections();
  }, [search, pageSize, sortBy, sortOrder, semesterFilters]);

  // Click ngoài để tắt dropdown filter
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
        {/* ➕ Add */}
        <div className="flex flex-col">
          <Button onClick={onAdd} className="whitespace-nowrap">
            {addLabel}
          </Button>
        </div>

        {/* Hiển thị */}
        <div className="flex flex-col">
          <Label className="mb-1 text-sm font-medium">Hiển thị</Label>
          <select
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
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="border rounded-md px-3 py-2 text-sm bg-white shadow-sm"
            >
              <option value="class_section_id">ID</option>
              <option value="section_code">Mã lớp</option>
              <option value="semester">Học kỳ</option>
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

        {/* Bộ lọc */}
        <div className="relative inline-block text-left" ref={filterRef}>
          <Label className="mb-1 text-sm font-medium">Bộ lọc</Label>
          <button
            onClick={() => setOpenFilter(!openFilter)}
            className="w-40 border rounded-md px-3 py-2 text-sm bg-white shadow-sm flex items-center justify-between hover:bg-gray-50"
          >
            Chọn bộ lọc
            {semesterFilters.length > 0 && (
              <span className="ml-1 text-blue-600 font-semibold">
                ({semesterFilters.length})
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
            <div className="absolute left-0 mt-2 w-64 rounded-lg shadow-lg bg-white border z-20 p-6 space-y-6 text-sm">
              {/* Học kỳ */}
              <div>
                <p className="font-medium text-base mb-3">Học kỳ</p>
                <div className="grid grid-cols-3 gap-2">
                  {["1", "2", "Hè"].map((s) => (
                    <label key={s} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        value={s}
                        checked={semesterFilters.includes(s)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSemesterFilters([...semesterFilters, s]);
                          } else {
                            setSemesterFilters(semesterFilters.filter((x) => x !== s));
                          }
                        }}
                      />
                      {s}
                    </label>
                  ))}
                </div>
              </div>

              {/* Reset */}
              <button
                onClick={() => {
                  setSemesterFilters([]);
                  setOpenFilter(false);
                }}
                className="w-full px-3 py-2 text-base rounded-md bg-gray-100 hover:bg-gray-200 mt-2"
              >
                Thiết lập lại
              </button>
            </div>
          )}
        </div>

        {/* Search + total */}
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
