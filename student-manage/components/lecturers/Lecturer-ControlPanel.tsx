"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/shared/SearchBar";
import { Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { useLecturerStore } from "@/store/useLecturerStore";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";

interface ControlPanelLecturerProps {
  total: number;
  addLabel: string;
  onAdd: () => void;
  selectedCount: number;
  onBulkDelete: () => void;
  onReload: () => void;
}

export default function ControlPanelLecturer({
  total,
  addLabel,
  onAdd,
  selectedCount,
  onBulkDelete,
  onReload,
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

  const [openPrintModal, setOpenPrintModal] = useState(false);
  const [printTitle, setPrintTitle] = useState("DANH SÁCH GIẢNG VIÊN");

  // 🔹 Fetch departments
  useEffect(() => {
    axios
      .get("/api/departments")
      .then((r) => setDepartments(r.data.items))
      .catch(() => setDepartments([]));
  }, []);

  // 🔹 Đóng filter khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setOpenFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setOpenFilter]);

  // ======================
  // ⚙️ Các hàm xử lý
  // ======================
  const handleExport = async () => {
    const res = await fetch("/api/lecturers/export");
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lecturers.xlsx";
    a.click();
    a.remove();
  };

  const handleImport = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/lecturers/import", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(data.message);
      onReload?.();
    } else toast.error(data.error);
  };

  const handleBackup = async () => {
    const res = await fetch("/api/lecturers/backup", { method: "POST" });
    const data = await res.json();
    if (res.ok) toast.success(`Backup thành công: ${data.filename}`);
    else toast.error(data.error);
  };

  const handleResetFilters = () => {
    setGenderFilters([]);
    setDepartmentFilters([]);
    setPositionFilters([]);
    setOpenFilter(false);
  };

  // ======================
  // 📦 Giao diện
  // ======================
  return (
    <div className="p-4 mb-6 bg-gray-50 border rounded-lg shadow-sm space-y-4">
      {/* =========================
          HÀNG 1: BUTTONS + SEARCH
      ========================== */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Button onClick={onAdd}>{addLabel}</Button>
          <Button
            variant="ghost"
            className="bg-gray-200 hover:bg-gray-300 transition"
            onClick={handleExport}
          >
            Xuất dữ liệu
          </Button>
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
          <Button
            variant="ghost"
            className="bg-gray-200 hover:bg-gray-300 transition"
            onClick={handleBackup}
          >
            Sao lưu
          </Button>

          <Button
          variant="ghost"
          className="bg-gray-200 hover:bg-gray-300 transition"
          onClick={() => setOpenPrintModal(true)}
        >
          🖨 In danh sách
        </Button>

        {/* Dialog nhập tiêu đề in */}
        <Dialog open={openPrintModal} onOpenChange={setOpenPrintModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nhập tiêu đề danh sách</DialogTitle>
            </DialogHeader>

            <div className="space-y-3 mt-3">
              <Label htmlFor="printTitle">Tiêu đề</Label>
              <Input
                id="printTitle"
                value={printTitle}
                onChange={(e) => setPrintTitle(e.target.value)}
                placeholder="Nhập tiêu đề (ví dụ: DANH SÁCH GIẢNG VIÊN KHOA CNTT)"
              />
            </div>

            <DialogFooter>
              <Button variant="secondary" onClick={() => setOpenPrintModal(false)}>
                Hủy
              </Button>
              <Button
                onClick={() => {
                  const params = new URLSearchParams();

                  params.append("title", encodeURIComponent(printTitle));
                  if (search) params.append("search", search);
                  if (genderFilters.length) params.append("gender", genderFilters.join(","));
                  if (departmentFilters.length) params.append("department_code", departmentFilters.join(","));
                  if (positionFilters.length) params.append("position", positionFilters.join(","));

                  // 🔹 Thêm phần gửi tên khoa để in ra bên dưới tiêu đề
                  const selectedDepartmentNames = departments
                    .filter((d) => departmentFilters.includes(d.department_code))
                    .map((d) => d.department_name);

                  if (selectedDepartmentNames.length)
                    params.append(
                      "selectedDepartmentNames",
                      selectedDepartmentNames.map(encodeURIComponent).join(",")
                    );

                  const url = `/api/lecturers/print-report?${params.toString()}`;
                  const newTab = window.open(url, "_blank");
                  if (newTab) newTab.focus();
                  setOpenPrintModal(false);
                }}
              >
                In danh sách
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        </div>

        <div className="ml-auto">
          <SearchBar search={search} onChange={setSearch} onClear={() => setSearch("")} />
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
                <option value="lecturer_id">ID Giảng viên</option>
                <option value="first_name">Tên Giảng viên</option>
                <option value="lecturer_code">Mã Giảng viên</option>
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
                {genderFilters.length + departmentFilters.length + positionFilters.length > 0 && (
                  <span className="ml-1 text-blue-600 font-semibold">
                    ({genderFilters.length + departmentFilters.length + positionFilters.length})
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
                                e.target.checked ? [...prev, g] : prev.filter((x) => x !== g)
                              )
                            }
                          />
                          {g}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Khoa */}
                  <div>
                    <p className="font-medium text-base mb-3">Khoa</p>
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

                  {/* Chức vụ */}
                  <div>
                    <p className="font-medium text-base mb-3">Chức vụ</p>
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

                  <Button variant="secondary" onClick={handleResetFilters} className="w-full mt-2">
                    Thiết lập lại
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tổng / Đã chọn */}
        <div className="flex items-center gap-2 text-sm ml-auto">
          <span>Đã chọn: {selectedCount} / {total}</span>
          <ConfirmDialog
            onConfirm={onBulkDelete}
            title={`Xóa ${selectedCount} giảng viên?`}
            description="Giảng viên sẽ bị xóa vĩnh viễn và không thể hoàn tác."
            trigger={
              <button
                disabled={!selectedCount}
                className={`ml-2 p-1 ${
                  selectedCount ? "text-red-600" : "text-gray-400 cursor-not-allowed"
                }`}
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
