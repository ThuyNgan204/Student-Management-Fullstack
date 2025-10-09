"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "sonner";
import { Eye, Pencil } from "lucide-react";
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

import { useDebounce } from "@/hooks/useDebounce";
import { useCRUD } from "@/hooks/useCRUD";
import { ClassFormInputs, classSchema } from "@/lib/zodSchemas";
import { AcademicClass, useClassStore } from "@/store/useClassStore";
import ControlPanelClass from "@/components/classes/ClassControlPanel";
import ClassDetail from "@/components/classes/ClassDetailModal";
import { Label } from "@/components/ui/label";

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

  // ✅ Thêm các dòng này
  departmentFilters,
  majorFilters,
  lecturerFilters,
  cohortFilters,
} = useClassStore();


  const [majors, setMajors] = useState<any[]>([]);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const debouncedSearch = useDebounce(search, 500);

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
      lecturer: lecturerFilters,
      cohort: cohortFilters,
    },
  });

  // ===== Form Add =====
  const formAdd = useForm<ClassFormInputs>({
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
  const formEdit = useForm<ClassFormInputs>({
    resolver: zodResolver(classSchema),
  });

  const onSubmitAdd = (dataForm: ClassFormInputs) => {
    addMutation.mutate(dataForm, {
      onSuccess: () => {
        toast.success("Thêm lớp học thành công");
        formAdd.reset();
        setAddOpen(false);
      },
      onError: () => toast.error("Thêm lớp học thất bại"),
    });
  };

  const handleEdit = (c: AcademicClass) => {
    setEditingClass(c);
    formEdit.reset({
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
            formEdit.reset();
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

  const totalPages = data ? Math.ceil(data.total / pageSize) : 1;

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <ControlPanelClass
        total={data?.total ?? 0}
        addLabel="Thêm lớp sinh hoạt"
        addTotal="Tổng lớp sinh hoạt"
        onAdd={() => setAddOpen(true)}
      />

      <main className="flex-1 overflow-x-auto px-6 py-4">
        {isLoading && <p>Đang tải...</p>}
        {isError && <p>Tải danh dách lớp sinh hoạt thất bại.</p>}

        {!isLoading && !isError && (
          <>
            <DataTable
              columns={[
                { key: "academic_class_id", header: "ID" },
                { key: "class_name", header: "Tên lớp" },
                { key: "class_code", header: "Mã lớp" },
                { key: "cohort", header:"Niên khóa"},
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
                        c.majors?.departments?.department_name ?? "N/A", // ✅ hiển thị tên khoa
                    },

                {
                  key: "actions",
                  header: "Thao tác",
                  render: (c: AcademicClass) => (
                    <div className="space-x-2">
                      <Button variant="secondary" onClick={() => handleView(c.academic_class_id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="default" onClick={() => handleEdit(c)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <ConfirmDialog
                        onConfirm={() => deleteMutation.mutate(c.academic_class_id)}
                        title="Bạn đã chắc chắn?"
                        description="Lớp sinh hoạt này sẽ bị xóa vĩnh viễn và không thể hoàn tác."
                      />
                    </div>
                  ),
                },
              ]}
              data={data?.items || []}
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
        if (!open) formAdd.reset();
        setAddOpen(open);
    }}
    >
    <DialogContent className="max-w-lg">
        <DialogHeader>
        <DialogTitle>Thêm lớp sinh hoạt</DialogTitle>
        </DialogHeader>

        <form onSubmit={formAdd.handleSubmit(onSubmitAdd)} className="space-y-4">
        <div>
            <Label className="mb-2">Tên lớp sinh hoạt</Label>
            <Input {...formAdd.register("class_name")} />
            {formAdd.formState.errors.class_name && (
            <p className="text-xs text-red-500">{formAdd.formState.errors.class_name.message}</p>
            )}
        </div>

        <div>
            <Label className="mb-2">Mã lớp sinh hoạt</Label>
            <Input {...formAdd.register("class_code")}/>
            {formAdd.formState.errors.class_code && (
            <p className="text-xs text-red-500">{formAdd.formState.errors.class_code.message}</p>
            )}
        </div>

        <div>
            <Label className="mb-2">Khóa</Label>
            <Input {...formAdd.register("cohort")} />
            {formAdd.formState.errors.cohort && (
            <p className="text-xs text-red-500">{formAdd.formState.errors.cohort.message}</p>
            )}
        </div>

        <div>
            <Label className="mb-2">Chuyên ngành</Label>
            <select
              {...formAdd.register("major_id", { valueAsNumber: true })}
              defaultValue=""
              className="border rounded px-2 py-1 w-full text-gray-800 [&:invalid]:text-gray-600"
              required
            >
              <option value="" disabled>
                Chọn chuyên ngành
              </option>
              {majors.map((m) => (
                <option key={m.major_id} value={m.major_id}>
                  {m.major_name}
                </option>
              ))}
            </select>
        </div>

        <div>
            <Label className="mb-2">Giảng viên cố vấn</Label>
            <select
            {...formAdd.register("lecturer_id", { valueAsNumber: true })}
            defaultValue=""
            className="border rounded px-2 py-1 w-full text-gray-800 [&:invalid]:text-gray-600"
            required
            >
            
            <option value="" disabled>Chọn giảng viên</option>
            {lecturers.map((l) => (
                <option key={l.lecturer_id} value={l.lecturer_id}>
                {l.last_name} {l.first_name}
                </option>
            ))}
            </select>
        </div>

        <DialogFooter className="flex justify-end space-x-2">
            <Button
            variant="outline"
            type="button"
            onClick={() => {
                formAdd.reset();
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

        <form onSubmit={formEdit.handleSubmit(handleUpdate)} className="space-y-4">
        <div>
            <Label className="mb-2">Tên lớp sinh hoạt</Label>
            <Input {...formEdit.register("class_name")} />
            {formEdit.formState.errors.class_name && (
            <p className="text-xs text-red-500">{formEdit.formState.errors.class_name.message}</p>
            )}
        </div>

        <div>
            <Label className="mb-2">Mã lớp sinh hoạt</Label>
            <Input {...formEdit.register("class_code")} />
            {formEdit.formState.errors.class_code && (
            <p className="text-xs text-red-500">{formEdit.formState.errors.class_code.message}</p>
            )}
        </div>

        <div>
            <Label className="mb-2">Khóa</Label>
            <Input {...formEdit.register("cohort")} />
        </div>

        <div>
            <Label className="mb-2">Chuyên ngành</Label>
            <select
            {...formEdit.register("major_id", { valueAsNumber: true })}
            defaultValue=""
            className="border rounded px-2 py-1 w-full text-gray-800 [&:invalid]:text-gray-600"
            required
            >
            
<option value="" disabled>Chọn chuyên ngành</option>
            {majors.map((m) => (
                <option key={m.major_id} value={m.major_id}>
                {m.major_name}
                </option>
            ))}
            </select>
        </div>

        <div>
            <Label className="mb-2">Giảng viên cố vấn</Label>
            <select
            {...formEdit.register("lecturer_id", { valueAsNumber: true })}
            defaultValue=""
            className="border rounded px-2 py-1 w-full text-gray-800 [&:invalid]:text-gray-600"
            required
            >
            
<option value="" disabled>Chọn giảng viên</option>
            {lecturers.map((l) => (
                <option key={l.lecturer_id} value={l.lecturer_id}>
                {l.last_name} {l.first_name}
                </option>
            ))}
            </select>
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
      <DetailDialog open={!!selectedClass} title="Chi tiết lớp sinh hoạt" onClose={() => setSelectedClass(null)}>
        {selectedClass && <ClassDetail academicClass={selectedClass} />}
      </DetailDialog>
    </div>
  );
}
