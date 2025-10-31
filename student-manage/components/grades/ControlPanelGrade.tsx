"use client";

import SearchBar from "@/components/shared/SearchBar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useGradeStore } from "@/store/useGradeStore";
import { Printer } from "lucide-react";
import { useEffect } from "react";

interface Props {
  total: number;
  students: any[];
  classSections: any[];
  academicClasses: any[];
  onAdd: () => void;
}

export default function ControlPanelGrade({ total, students, classSections, academicClasses, onAdd }: Props) {
  const {
    search,
    pageSize,
    sortBy,
    sortOrder,
    studentFilters,
    classSectionFilters,
    academicClassFilters,
    setSearch,
    setPage,
    setPageSize,
    setSortBy,
    setSortOrder,
    setStudentFilters,
    setClassSectionFilters,
    setAcademicClassFilters,
    fetchGrades,
  } = useGradeStore();

  useEffect(() => {
    fetchGrades();
  }, [search, pageSize, sortBy, sortOrder, studentFilters, classSectionFilters, academicClassFilters]);

  const handlePrint = () => {
    const params = new URLSearchParams();

    if (studentFilters[0]) params.append("student_id", String(studentFilters[0]));
    if (classSectionFilters[0]) params.append("class_section_id", String(classSectionFilters[0]));

    // Cho phép in theo lớp học phần nếu không chọn sinh viên
    if (!studentFilters[0] && !classSectionFilters[0]) {
      alert("Vui lòng chọn ít nhất 1 sinh viên hoặc 1 lớp học phần để in.");
      return;
    }

    window.open(`/api/grades/print-report?${params.toString()}`, "_blank");
  };

  return (
    <div className="p-4 mb-6 bg-gray-50 border rounded-lg shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex gap-2">
          <Button onClick={onAdd}>Thêm điểm</Button>

          {/* ✅ Nút In */}
          <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
            <Printer size={16} /> In bảng điểm
          </Button>
        </div>

        {/* Page size */}
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

        {/* Sorting */}
        <div className="flex flex-col">
          <Label className="mb-1 text-sm">Sắp xếp</Label>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm bg-white shadow-sm"
            >
              <option value="grade_id">ID</option>
              <option value="total_score">Tổng điểm</option>
              <option value="student_name">Tên sinh viên</option>
              <option value="student_code">MSSV</option>
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

        {/* Search */}
        <div className="flex-1 max-w-sm ml-auto">
          <SearchBar search={search} onChange={(v) => { setSearch(v); setPage(1); }} onClear={() => setSearch("")} />
          <span className="mt-1 text-xs text-gray-600 text-right block">
            Tổng: <span className="font-semibold">{total}</span>
          </span>
        </div>
      </div>

      {/* Filters Row */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        {/* Filter Sinh Viên */}
        <div>
          <Label className="mb-1 text-sm">Sinh viên</Label>
          <select
            value={studentFilters[0] ?? ""}
            onChange={(e) => {
              const val = e.target.value ? [Number(e.target.value)] : [];
              setStudentFilters(val);
              setPage(1);
            }}
            className="border rounded px-2 py-1 w-full"
          >
            <option value="">Tất cả</option>
            {students.map((st) => (
              <option key={st.student_id} value={st.student_id}>
                {st.student_code} — {st.last_name} {st.first_name}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Lớp Học Phần */}
        <div>
          <Label className="mb-1 text-sm">Lớp học phần</Label>
          <select
            value={classSectionFilters[0] ?? ""}
            onChange={(e) => {
              const val = e.target.value ? [Number(e.target.value)] : [];
              setClassSectionFilters(val);
              setPage(1);
            }}
            className="border rounded px-2 py-1 w-full"
          >
            <option value="">Tất cả</option>
            {classSections.map((e) => (
              <option key={e.class_section_id} value={e.class_section_id}>
                {e.section_code} — {e.courses?.course_code ?? "??"} - {e.courses?.course_name ?? "Không rõ"}
              </option>
            ))}
          </select>
        </div>

        {/* ✅ Filter Lớp Sinh Hoạt */}
        <div>
          <Label className="mb-1 text-sm">Lớp sinh hoạt</Label>
          <select
            onChange={(e) => {
              const val = e.target.value ? [Number(e.target.value)] : [];
              setAcademicClassFilters(val);
              setPage(1);
            }}
            className="border rounded px-2 py-1 w-full"
          >
            <option value="">Tất cả</option>
            {academicClasses.map((cls) => (
              <option key={cls.academic_class_id} value={cls.academic_class_id}>
                {cls.class_code} — {cls.class_name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
