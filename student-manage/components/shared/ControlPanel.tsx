"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import SearchBar from "./SearchBar";
import { useStudentStore } from "@/store/useStudentStore";
import { Trash2 } from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";

interface ControlPanelProps {
  total: number;
  addLabel: string;
  onAdd: () => void;
  selectedCount: number;       // ✅ thêm
  onBulkDelete: () => void; 
  onReload: () => void;
}

export default function ControlPanel({
  total,
  addLabel,
  onAdd,
  selectedCount,
  onBulkDelete,
  onReload,
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

  const [openPrintModal, setOpenPrintModal] = useState(false);
  const [printTitle, setPrintTitle] = useState("DANH SÁCH SINH VIÊN");

  // Fetch majors & classes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [majorsRes, classesRes] = await Promise.all([
          axios.get("/api/majors"),
          axios.get("/api/academic_class"),
        ]);
        setMajors(majorsRes.data.items);
        setClasses(classesRes.data.items);
      } catch {
        setMajors([]);
        setClasses([]);
      }
    };
    fetchData();
  }, []);

  // Close filter dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setOpenFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setOpenFilter]);

  // Handlers
  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (sortBy) params.append("sort_by", sortBy);
      if (sortOrder) params.append("sort_order", sortOrder);
      if (genderFilters.length) params.append("gender", genderFilters.join(","));
      if (classFilters.length) params.append("class_code", classFilters.join(","));
      if (majorFilters.length) params.append("major_code", majorFilters.join(","));

      const res = await fetch(`/api/students/export?${params.toString()}`);
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // ✅ Tạo tên file động theo filter
      const time = new Date().toISOString().slice(0, 10);
      let fileName = `sinhvien_${time}.xlsx`;
      if (majorFilters.length === 1) fileName = `sinhvien_${majorFilters[0]}_${time}.xlsx`;
      else if (classFilters.length === 1) fileName = `sinhvien_${classFilters[0]}_${time}.xlsx`;

      a.download = fileName;
      a.click();
      a.remove();
    } catch (error) {
      console.error(error);
      toast.error("Xuất Excel thất bại!");
    }
  };

  const handleImport = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/students/import", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(data.message);
      onReload?.();
    }
    else toast.error(data.error);
  };

  const handleBackup = async () => {
    const res = await fetch("/api/students/backup", { method: "POST" });
    const data = await res.json();
    if (res.ok) toast.success(`Backup thành công: ${data.filename}`);
    else toast.error(data.error);
  };

  const handleResetFilters = () => {
    setGenderFilters([]);
    setClassFilters([]);
    setMajorFilters([]);
    setOpenFilter(false);
  };

  return (
    <div className="p-4 mb-6 bg-gray-50 border rounded-lg shadow-sm space-y-4">
      {/* =========================
          HÀNG 1: BUTTONS + SEARCH
      ========================== */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Button onClick={onAdd}>{addLabel}</Button>
          <Button variant="ghost" className="bg-gray-200 hover:bg-gray-300 transition" onClick={handleExport}>Xuất dữ liệu</Button>
          <label className="cursor-pointer bg-gray-200 px-3 py-2 rounded text-sm font-medium hover:bg-gray-300 transition">
            Nhập dữ liệu
            <input
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImport(file);
              }}
            />
          </label>
          <Button variant="ghost" className="bg-gray-200 hover:bg-gray-300 transition" onClick={handleBackup}>Sao lưu</Button>

          <Button
            variant="ghost"
            className="bg-gray-200 hover:bg-gray-300 transition"
            onClick={() => {
              const params = new URLSearchParams();
              if (search) params.append("search", search);
              if (sortBy) params.append("sort_by", sortBy);
              if (sortOrder) params.append("sort_order", sortOrder);
              if (genderFilters.length) params.append("gender", genderFilters.join(","));
              if (classFilters.length) params.append("class_code", classFilters.join(","));
              if (majorFilters.length) params.append("major_code", majorFilters.join(","));

              // 🧾 tiêu đề động theo filter
              let title = "DANH SÁCH SINH VIÊN";
              if (majorFilters.length === 1) title += ` - Ngành ${majorFilters[0]}`;
              else if (classFilters.length === 1) title += ` - Lớp ${classFilters[0]}`;

              // encode tiêu đề vào URL để backend render
              params.append("title", title);

              // trong ControlPanel: nút In danh sách (đoạn bạn đã có)
              const url = `/api/students/print-report?${params.toString()}`;
              const newTab = window.open(url, "_blank");
              if (newTab) newTab.focus();

            }}
          >
            🖨 In danh sách
          </Button>

        </div>

        <div className="ml-auto">
          <SearchBar
            search={search}
            onChange={setSearch}
            onClear={() => setSearch("")}
          />
        </div>
      </div>

      {/* =========================
          HÀNG 2: FILTER + SORT + PAGE SIZE + TOTAL
      ========================== */}
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-6">
        {/* Hiển thị */}
        <div className="flex items-center gap-2">
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

        {/* Sắp xếp */}
        <div className="flex items-center gap-2">
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
              <option value="student_id">ID sinh viên</option>
              <option value="first_name">Tên sinh viên</option>
              <option value="student_code">MSSV</option>
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
        <div className="flex items-center gap-2">
        <Label className="mb-1 text-sm font-medium">Bộ lọc</Label>
        <div className="relative inline-block text-left" ref={filterRef}>
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
              className={`w-4 h-4 text-gray-500 ml-2 transform ${
                openFilter ? "rotate-180" : "rotate-0"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {openFilter && (
            <div className="absolute left-0 mt-2 w-[420px] rounded-lg shadow-lg bg-white border z-20 p-6 space-y-6 text-sm">
              {/* Giới tính */}
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

              {/* Lớp */}
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
                            e.target.checked
                              ? [...prev, cls.class_code]
                              : prev.filter((x) => x !== cls.class_code)
                          )
                        }
                      />
                      {cls.class_code}
                    </label>
                  ))}
              </div>
              </div>

              {/* Ngành */}
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
                            e.target.checked
                              ? [...prev, dept.major_code]
                              : prev.filter((x) => x !== dept.major_code)
                          )
                        }
                      />
                      {dept.major_code}
                    </label>
                  ))}
              </div>
              </div>

              <Button
                variant="secondary"
                onClick={handleResetFilters}
                className="w-full mt-2"
              >
                Thiết lập lại
              </Button>
            </div>
          )}
        </div>
      </div>
      </div>

         <div className="flex items-center gap-2 text-sm ml-auto">
          <span>Đã chọn: {selectedCount} / {total}</span>
          <ConfirmDialog
            onConfirm={onBulkDelete}
            title={`Xóa ${selectedCount} sinh viên?`}
            description="Sinh viên sẽ bị xóa vĩnh viễn và không thể hoàn tác."
            trigger={
              <button
                disabled={!selectedCount}
                className={`ml-2 p-1 ${selectedCount ? "text-red-600" : "text-gray-400 cursor-not-allowed"}`}
              >
                 <Trash2 size={16} />
              </button>
            }
        />
        </div>
        </div>
    </div>
  );
}
