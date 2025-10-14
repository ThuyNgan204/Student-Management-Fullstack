"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/shared/SearchBar";
import { useGradeStore } from "@/store/useGradeStore";
import { useEffect } from "react";

interface Props {
  total: number;
  enrollment: any[];
  onAdd: () => void;
}

export default function ControlPanelGrade({ total, enrollment, onAdd }: Props) {
  const {
    search,
    pageSize,
    sortBy,
    sortOrder,
    enrollmentFilters,
    gradeTypeFilters,
    setSearch,
    setPage,
    setPageSize,
    setSortBy,
    setSortOrder,
    setEnrollmentFilters,
    setGradeTypeFilters,
    fetchGrades,
  } = useGradeStore();

  useEffect(() => {
    fetchGrades();
  }, [search, pageSize, sortBy, sortOrder, enrollmentFilters, gradeTypeFilters]);

  return (
    <div className="p-4 mb-6 bg-gray-50 border rounded-lg shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <Button onClick={onAdd}>Thêm điểm</Button>

        <div>
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
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <Label className="mb-1 text-sm">Sắp xếp</Label>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm bg-white shadow-sm"
            >
              <option value="grade_id">ID</option>
              <option value="score">Điểm</option>
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

        <div className="flex-1 max-w-sm ml-auto">
          <SearchBar search={search} onChange={(v) => { setSearch(v); setPage(1); }} onClear={() => setSearch("")} />
          <span className="mt-1 text-xs text-gray-600 text-right block">
            Tổng: <span className="font-semibold">{total}</span>
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <Label className="mb-1 text-sm">Đăng ký học phần</Label>
          <select
            value={enrollmentFilters[0] ?? ""}
            onChange={(e) =>
              setEnrollmentFilters(e.target.value ? [Number(e.target.value)] : [])
            }
            className="border rounded px-2 py-1 w-full"
          >
            <option value="">Tất cả</option>
            {enrollment.map((en) => (
              <option key={en.enrollment_id} value={en.enrollment_id}>
                {en.enrollment_id} — {en.students?.student_code}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label className="mb-1 text-sm">Loại điểm</Label>
          <select
            value={gradeTypeFilters[0] ?? ""}
            onChange={(e) =>
              setGradeTypeFilters(e.target.value ? [e.target.value] : [])
            }
            className="border rounded px-2 py-1 w-full"
          >
            <option value="">Tất cả</option>
            <option value="Giữa kỳ">Giữa kỳ</option>
            <option value="Cuối kỳ">Cuối kỳ</option>
            <option value="Khác">Khác</option>
          </select>
        </div>
      </div>
    </div>
  );
}
