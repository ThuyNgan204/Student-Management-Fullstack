"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/shared/SearchBar";
import { useEnrollmentStore } from "@/store/useEnrollmentStore";
import { useEffect, useRef } from "react";

interface Props {
  total: number;
  students: any[];
  classSections: any[];
  onAdd: () => void;
}

export default function ControlPanelEnrollment({ total, students, classSections, onAdd }: Props) {
  const {
    search,
    pageSize,
    sortBy,
    sortOrder,
    studentFilters,
    classSectionFilters,
    statusFilters,
    setSearch,
    setPage,
    setPageSize,
    setSortBy,
    setSortOrder,
    setStudentFilters,
    setClassSectionFilters,
    setStatusFilters,
    fetchEnrollments,
  } = useEnrollmentStore() as any;

  useEffect(() => {
  fetchEnrollments();
}, [search, pageSize, sortBy, sortOrder, studentFilters, classSectionFilters, statusFilters]);


  return (
    <div className="p-4 mb-6 bg-gray-50 border rounded-lg shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-6">
        {/* Add Button */}
        <div>
          <Button onClick={onAdd}>Đăng kí học phần</Button>
        </div>

        {/* Page Size */}
        <div>
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
      <option value="enrollment_id">Mã đăng kí</option>
      <option value="student_id">ID Sinh viên</option>
      <option value="class_section_id">ID Lớp học phần</option>
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

        {/* Search */}
        <div className="flex-1 max-w-sm ml-auto">
          <div className="flex justify-end">
          <SearchBar
            search={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            onClear={() => setSearch("")}
          />
          </div>
          <div className="mt-1 text-xs text-gray-600 flex justify-end">
            Tổng: <span className="font-semibold ml-1">{total}</span>
          </div>
        </div>
      </div>

      {/* Filters giữ nguyên như bạn yêu cầu */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div>
          <Label className="mb-1 text-sm">Sinh viên</Label>
          <select
            value={studentFilters[0] ?? ""}
            onChange={(e) => setStudentFilters(e.target.value ? [Number(e.target.value)] : [])}
            className="border rounded px-2 py-1 w-full"
          >
            <option value="">Tất cả</option>
            {students.map((s) => (
              <option key={s.student_id} value={s.student_id}>
                {s.student_code} — {s.last_name} {s.first_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label className="mb-1 text-sm">Lớp học phần</Label>
          <select
            value={classSectionFilters[0] ?? ""}
            onChange={(e) => setClassSectionFilters(e.target.value ? [Number(e.target.value)] : [])}
            className="border rounded px-2 py-1 w-full"
          >
            <option value="">Tất cả</option>
            {classSections.map((c) => (
              <option key={c.class_section_id} value={c.class_section_id}>
                {c.section_code}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label className="mb-1 text-sm">Trạng thái</Label>
          <select
            value={statusFilters[0] ?? ""}
            onChange={(e) => setStatusFilters(e.target.value ? [e.target.value] : [])}
            className="border rounded px-2 py-1 w-full"
          >
            <option value="">Tất cả</option>
            <option>Đang học</option>
            <option>Hoàn thành</option>
            <option>Hủy</option>
          </select>
        </div>
      </div>
    </div>
  );
}
