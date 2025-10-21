"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

import DataTable from "@/components/shared/DataTable";
import Pagination from "@/components/shared/Pagination";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
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
import { useCRUD } from "@/hooks/useCRUD";
import { MajorFormInputs, majorSchema } from "@/lib/zodSchemas";
import { Major, useMajorStore } from "@/store/useMajorStore";
import { Department } from "@/store/useDepartmentStore";
import ControlPanelMajor from "@/components/majors/Majors-ControlPanel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function MajorsPage() {
  const {
    page,
    pageSize,
    search,
    sortBy,
    sortOrder,
    departmentFilters,
    setPage,
    setSearch,
    addOpen,
    setAddOpen,
    editingMajor,
    setEditingMajor,
  } = useMajorStore();

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sortBy, sortOrder, departmentFilters, setPage]);

  const {
    data,
    isLoading,
    isError,
    addMutation,
    updateMutation,
    deleteMutation,
  } = useCRUD<Major, MajorFormInputs>({
    resource: "majors",
    idField: "major_id",
    page,
    pageSize,
    search: debouncedSearch,
    sortBy: sortBy || "major_id",
    sortOrder,
    filters: {
        department: departmentFilters,
    }
  });

  // 🔹 Danh sách khoa để select
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    axios
      .get("/api/departments")
      .then((res) => setDepartments(res.data.items || []))
      .catch(() => toast.error("Không thể tải danh sách khoa"));
  }, []);

  // 🔹 Form thêm ngành
  const formAdd = useForm<MajorFormInputs>({
    resolver: zodResolver(majorSchema),
    defaultValues: { major_name: "", major_code: "", department_id: 0 },
  });

  // 🔹 Form chỉnh sửa ngành
  const formEdit = useForm<MajorFormInputs>({
    resolver: zodResolver(majorSchema),
  });

  const onSubmitAdd = (dataForm: MajorFormInputs) => {
    addMutation.mutate(dataForm, {
      onSuccess: () => {
        toast.success("Thêm chuyên ngành thành công");
        formAdd.reset();
        setAddOpen(false);
      },
      onError: () => toast.error("Thêm chuyên ngành thất bại"),
    });
  };

  const handleEdit = (mj: Major) => {
    setEditingMajor(mj);
    formEdit.reset({
      major_name: mj.major_name,
      major_code: mj.major_code,
      department_id: mj.department_id,
    });
  };

  const handleUpdate = (dataForm: MajorFormInputs) => {
    if (editingMajor) {
      updateMutation.mutate(
        { ...editingMajor, ...dataForm },
        {
          onSuccess: () => {
            toast.success("Cập nhật chuyên ngành thành công");
            formEdit.reset();
            setEditingMajor(null);
          },
          onError: () => toast.error("Cập nhật thất bại"),
        }
      );
    }
  };

  const { items: majors = [], total = 0 } = data ?? {};
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <ControlPanelMajor
        total={total}
        addLabel="Thêm chuyên ngành"
        addTotal="Tổng chuyên ngành"
        onAdd={() => setAddOpen(true)}
      />

      <main className="flex-1 overflow-x-auto px-6 py-4">
        {isLoading && <p>Đang tải dữ liệu...</p>}
        {isError && <p>Lỗi tải danh sách chuyên ngành.</p>}

        {!isLoading && !isError && (
          <>
            <DataTable
              columns={[
                { key: "major_id", header: "ID" },
                { key: "major_code", header: "Mã chuyên ngành" },
                { key: "major_name", header: "Tên chuyên ngành" },
                {
                  key: "departments.department_name",
                  header: "Tên khoa quản lý",
                  render: (mj: Major) => mj.departments?.department_name || "-",
                },
                {
                  key: "actions",
                  header: "Thao tác",
                  className: "text-center",
                  render: (mj: Major) => (
                    <div className="flex justify-center space-x-2 gap-2">
                      <button
                        className="text-gray-500 hover:text-yellow-600 cursor-pointer transition-colors"
                        onClick={() => handleEdit(mj)}
                      >
                        <Pencil className="size-4" />
                      </button>
                      <ConfirmDialog
                        onConfirm={() => deleteMutation.mutate(mj.major_id)}
                        title="Bạn đã chắc chắn?"
                        description="Chuyên ngành này sẽ bị xóa vĩnh viễn và không thể hoàn tác."
                        trigger={
                          <button
                            className="text-red-500 hover:text-red-700 cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        }
                      />
                    </div>
                  ),
                },
              ]}
              data={majors}
              emptyMessage="Không có chuyên ngành nào được tìm thấy"
            />

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </main>

      {/* ADD MODAL */}
      <Dialog
        open={addOpen}
        onOpenChange={(open) => {
          if (!open) formAdd.reset();
          setAddOpen(open);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm chuyên ngành mới</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={formAdd.handleSubmit(onSubmitAdd)}
            className="space-y-4"
          >
            <div>
              <Label className="mb-2">Mã chuyên ngành</Label>
              <Input {...formAdd.register("major_code")} />
              {formAdd.formState.errors.major_code && (
                <p className="text-xs text-red-500">
                  {formAdd.formState.errors.major_code.message}
                </p>
              )}
            </div>

            <div>
              <Label className="mb-2">Tên chuyên ngành</Label>
              <Input {...formAdd.register("major_name")} />
              {formAdd.formState.errors.major_name && (
                <p className="text-xs text-red-500">
                  {formAdd.formState.errors.major_name.message}
                </p>
              )}
            </div>

            <div>
              <Label className="mb-2">Khoa quản lý</Label>
              <Select onValueChange={(value) => formAdd.setValue("department_id", Number(value))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn khoa quản lý" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {departments.map((d) => (
                    <SelectItem key={d.department_id} value={d.department_id.toString()}>
                      {d.department_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formAdd.formState.errors.department_id && (
                <p className="text-xs text-red-500">
                  {formAdd.formState.errors.department_id.message}
                </p>
              )}
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

      {/* EDIT MODAL */}
      <Dialog
        open={!!editingMajor}
        onOpenChange={(open) => {
          if (!open) setEditingMajor(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa chuyên ngành</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={formEdit.handleSubmit(handleUpdate)}
            className="space-y-4"
          >
            <div>
              <Label className="mb-2">Mã chuyên ngành</Label>
              <Input {...formEdit.register("major_code")} />
              {formEdit.formState.errors.major_code && (
                <p className="text-xs text-red-500">
                  {formEdit.formState.errors.major_code.message}
                </p>
              )}
            </div>

            <div>
              <Label className="mb-2">Tên chuyên ngành</Label>
              <Input {...formEdit.register("major_name")} />
              {formEdit.formState.errors.major_name && (
                <p className="text-xs text-red-500">
                  {formEdit.formState.errors.major_name.message}
                </p>
              )}
            </div>

            <div>
              <Label className="mb-2">Khoa quản lý</Label>
              <Select
                defaultValue={
                  editingMajor?.department_id
                    ? String(editingMajor.department_id)
                    : undefined
                }
                onValueChange={(value) =>
                  formEdit.setValue("department_id", Number(value))
                }
              >
                <SelectTrigger className="border rounded-md px-3 py-2 w-full bg-white shadow-sm">
                  <SelectValue placeholder="Chọn khoa" />
                </SelectTrigger>

                <SelectContent>
                  {departments.map((dep) => (
                    <SelectItem
                      key={dep.department_id}
                      value={String(dep.department_id)}
                    >
                      {dep.department_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formEdit.formState.errors.department_id && (
                <p className="text-xs text-red-500">
                  {formEdit.formState.errors.department_id.message}
                </p>
              )}
            </div>

            <DialogFooter className="flex justify-end space-x-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setEditingMajor(null)}
              >
                Đóng
              </Button>
              <Button type="submit">Cập nhật</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
