"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "sonner";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";

import DataTable from "@/components/shared/DataTable";
import Pagination from "@/components/shared/Pagination";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import DetailDialog from "@/components/shared/DetailModal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useDebounce } from "@/hooks/useDebounce";
import { useRouter, useSearchParams } from "next/navigation";
import { useCRUD } from "@/hooks/useCRUD";
import { ClassFormInputs, classSchema } from "@/lib/zodSchemas";
import { AcademicClass, useClassStore } from "@/store/useClassStore";
import ControlPanelClass from "@/components/classes/ClassControlPanel";
import ClassDetail from "@/components/classes/ClassDetailModal";

// ✅ import Select UI
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ClassesPage() {
  const {
    page,
    pageSize,
    search,
    sortBy,
    sortOrder,
    setPage,
    setSearch,
    addOpen,
    setAddOpen,
    editingClass,
    setEditingClass,
    selectedClass,
    setSelectedClass,
    departmentFilters,
    majorFilters,
    lecturerFilters,
    cohortFilters,
  } = useClassStore();

  const [majors, setMajors] = useState<any[]>([]);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const debouncedSearch = useDebounce(search, 500);

  const searchParams = useSearchParams();
  const router = useRouter();
  const lecturerParam = searchParams.get("lecturer");
  const isLecturerView = Boolean(lecturerFilters);


  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sortBy, sortOrder, setPage]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [majorsRes, lecturersRes] = await Promise.all([
          axios.get("/api/majors"),
          axios.get("/api/lecturers"),
        ]);
        setMajors(majorsRes.data.items || majorsRes.data);
        setLecturers(lecturersRes.data.items || lecturersRes.data);
      } catch (err) {
        console.error("Failed to load majors or lecturers", err);
      }
    };
    fetch();
  }, []);

  const { data, isLoading, isError, addMutation, updateMutation, deleteMutation } =
    useCRUD<AcademicClass, ClassFormInputs>({
      resource: "academic_class",
      idField: "academic_class_id",
      page,
      pageSize,
      search: debouncedSearch,
      sortBy: sortBy || "academic_class_id",
      sortOrder,
      filters: {
        department: departmentFilters,
        major: majorFilters,
        cohort: cohortFilters,
        lecturer: lecturerParam ? [lecturerParam] : lecturerFilters,
      },
    });

  // ===== Form Add =====
  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAdd,
    formState: { errors: errorsAdd },
    setValue: setValueAdd, // ✅ thêm dòng này
  } = useForm<ClassFormInputs>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      class_name: "",
      class_code: "",
      cohort: "",
      major_id: undefined,
      lecturer_id: undefined,
    },
  });

  // ===== Form Edit =====
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit },
    setValue: setValueEdit, // ✅ thêm dòng này
  } = useForm<ClassFormInputs>({
    resolver: zodResolver(classSchema),
  });

  const onSubmitAdd = (dataForm: ClassFormInputs) => {
    addMutation.mutate(dataForm, {
      onSuccess: () => {
        toast.success("Thêm lớp học thành công");
        resetAdd();
        setAddOpen(false);
      },
      onError: () => toast.error("Thêm lớp học thất bại"),
    });
  };

  const handleEdit = (c: AcademicClass) => {
    setEditingClass(c);
    resetEdit({
      class_name: c.class_name,
      class_code: c.class_code,
      cohort: c.cohort ?? "",
      major_id: c.major_id,
      lecturer_id: c.lecturer_id,
    });
  };

  const handleUpdate = (dataForm: ClassFormInputs) => {
    if (editingClass) {
      updateMutation.mutate(
        { ...editingClass, ...dataForm },
        {
          onSuccess: () => {
            toast.success("Cập nhật lớp học thành công");
            resetEdit();
            setEditingClass(null);
          },
          onError: () => toast.error("Cập nhật thất bại"),
        }
      );
    }
  };

  const handleView = async (id: number) => {
    try {
      const res = await axios.get(`/api/academic_class/${id}`);
      setSelectedClass(res.data);
    } catch {
      toast.error("Không tải được chi tiết lớp học");
    }
  };

  const { items: classes = [], total = 0 } = data ?? {};
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      {isLecturerView ? (
        <div className="px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            ← Quay lại
          </Button>
          <h2 className="text-lg font-semibold">Các lớp sinh hoạt đang cố vấn</h2>
          <div className="w-24" />
        </div>
      ) : (
      <ControlPanelClass
        total={total}
        addLabel="Thêm lớp sinh hoạt"
        addTotal="Tổng lớp sinh hoạt"
        onAdd={() => setAddOpen(true)}
      />
      )}

      <main className="flex-1 overflow-x-auto px-6 py-4">
        {isLoading && <p>Đang tải...</p>}
        {isError && <p>Tải danh sách lớp sinh hoạt thất bại.</p>}

        {!isLoading && !isError && (
          <>
            <DataTable
              columns={[
                { key: "academic_class_id", header: "ID" },
                { key: "class_name", header: "Tên lớp" },
                { key: "class_code", header: "Mã lớp" },
                { key: "cohort", header: "Niên khóa" },
                {
                  key: "lecturers",
                  header: "Giảng viên cố vấn",
                  render: (c: AcademicClass) =>
                    c.lecturers
                      ? `${c.lecturers.last_name} ${c.lecturers.first_name}`
                      : "Chưa phân công",
                },
                {
                  key: "majors",
                  header: "Ngành",
                  render: (c: AcademicClass) => c.majors?.major_name ?? "N/A",
                },
                {
                  key: "department",
                  header: "Khoa",
                  render: (c: AcademicClass) =>
                    c.majors?.departments?.department_name ?? "N/A",
                },
                {
                  key: "actions",
                  header: "Thao tác",
                  className: "text-center",
                  render: (c: AcademicClass) =>
                    !isLecturerView ? (
                    <div className="flex justify-center space-x-2 gap-2">
                      <button
                        className="text-blue-400 hover:text-blue-800 cursor-pointer transition-colors"
                        onClick={() => handleView(c.academic_class_id)}
                      >
                        <Eye className="size-4" />
                      </button>
                      <button
                        className="text-gray-500 hover:text-yellow-600 cursor-pointer transition-colors"
                        onClick={() => handleEdit(c)}
                      >
                        <Pencil className="size-4" />
                      </button>
                      <ConfirmDialog
                        onConfirm={() =>
                          deleteMutation.mutate(c.academic_class_id)
                        }
                        title="Bạn đã chắc chắn?"
                        description="Lớp sinh hoạt này sẽ bị xóa vĩnh viễn và không thể hoàn tác."
                        trigger={
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 size={16} />
                          </button>
                        }
                      />
                    </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <button
                          className="text-blue-400 hover:text-blue-800 cursor-pointer transition-colors"
                          onClick={() => handleView(c.academic_class_id)}
                        >
                          <Eye className="size-4" />
                        </button>
                      </div>
                    ),
                },
              ]}
              data={classes}
              emptyMessage="Không có lớp sinh hoạt nào"
            />

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </main>

      {/* ========== ADD MODAL ========== */}
      <Dialog
        open={addOpen}
        onOpenChange={(open) => {
          if (!open) resetAdd();
          setAddOpen(open);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Thêm lớp sinh hoạt</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmitAdd(onSubmitAdd)} className="space-y-4">
            <div>
              <Label className="mb-2">Tên lớp sinh hoạt</Label>
              <Input {...registerAdd("class_name")} />
              {errorsAdd.class_name && (
                <p className="text-xs text-red-500">{errorsAdd.class_name.message}</p>
              )}
            </div>

            <div>
              <Label className="mb-2">Mã lớp sinh hoạt</Label>
              <Input {...registerAdd("class_code")} />
              {errorsAdd.class_code && (
                <p className="text-xs text-red-500">{errorsAdd.class_code.message}</p>
              )}
            </div>

            <div>
              <Label className="mb-2">Khóa</Label>
              <Input {...registerAdd("cohort")} />
            </div>

            <div>
              <Label className="mb-2">Chuyên ngành</Label>
              <Select onValueChange={(value) => setValueAdd("major_id", Number(value))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn chuyên ngành" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {majors.map((m) => (
                    <SelectItem key={m.major_id} value={m.major_id.toString()}>
                      {m.major_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2">Giảng viên cố vấn</Label>
              <Select onValueChange={(value) => setValueAdd("lecturer_id", Number(value))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn giảng viên" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {lecturers.map((l) => (
                    <SelectItem key={l.lecturer_id} value={l.lecturer_id.toString()}>
                      {l.last_name} {l.first_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="flex justify-end space-x-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  resetAdd();
                  setAddOpen(false);
                }}
              >
                Đóng
              </Button>
              <Button type="submit">Lưu</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========== EDIT MODAL ========== */}
      <Dialog
        open={!!editingClass}
        onOpenChange={(open) => {
          if (!open) setEditingClass(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin lớp sinh hoạt</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmitEdit(handleUpdate)} className="space-y-4">
            <div>
              <Label className="mb-2">Tên lớp sinh hoạt</Label>
              <Input {...registerEdit("class_name")} />
              {errorsEdit.class_name && (
                <p className="text-xs text-red-500">{errorsEdit.class_name.message}</p>
              )}
            </div>

            <div>
              <Label className="mb-2">Mã lớp sinh hoạt</Label>
              <Input {...registerEdit("class_code")} />
              {errorsEdit.class_code && (
                <p className="text-xs text-red-500">{errorsEdit.class_code.message}</p>
              )}
            </div>

            <div>
              <Label className="mb-2">Khóa</Label>
              <Input {...registerEdit("cohort")} />
            </div>

            <div>
              <Label className="mb-2">Chuyên ngành</Label>
              <Select
                defaultValue={editingClass?.major_id ? String(editingClass.major_id) : undefined}
                onValueChange={(value) => setValueEdit("major_id", Number(value))}
              >
                <SelectTrigger
                  className="border rounded px-2 py-1 w-full text-gray-800 [&:invalid]:text-gray-600"
                >
                  <SelectValue placeholder="Chọn chuyên ngành" />
                </SelectTrigger>

                <SelectContent>
                  {majors.map((m) => (
                    <SelectItem key={m.major_id} value={String(m.major_id)}>
                      {m.major_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2">Giảng viên cố vấn</Label>
              <Select
                defaultValue={editingClass?.lecturer_id ? String(editingClass.lecturer_id) : undefined}
                onValueChange={(value) => setValueEdit("lecturer_id", Number(value))}
              >
                <SelectTrigger
                  className="border rounded px-2 py-1 w-full text-gray-800 [&:invalid]:text-gray-600"
                >
                  <SelectValue placeholder="Chọn giảng viên" />
                </SelectTrigger>

                <SelectContent>
                  {lecturers.map((l) => (
                    <SelectItem key={l.lecturer_id} value={String(l.lecturer_id)}>
                      {l.last_name} {l.first_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={() => setEditingClass(null)}>
                Đóng
              </Button>
              <Button type="submit">Cập nhật</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <DetailDialog
        open={!!selectedClass}
        title="Chi tiết lớp sinh hoạt"
        onClose={() => setSelectedClass(null)}
      >
        {selectedClass && <ClassDetail academicClass={selectedClass} />}
      </DetailDialog>
    </div>
  );
}
