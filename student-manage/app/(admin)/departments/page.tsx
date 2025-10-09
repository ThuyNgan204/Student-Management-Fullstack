"use client";

import { useEffect } from "react";
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
import { Label } from "@/components/ui/label";

import { useDebounce } from "@/hooks/useDebounce";
import { useCRUD } from "@/hooks/useCRUD";
import { z } from "zod";
import ControlPanel from "@/components/shared/ControlPanel";
import { Department, useDepartmentStore } from "@/store/useDepartmentStore";
import ControlPanelDepartment from "@/components/departments/ControlPanelDepartment";
import { DepartmentFormInputs, departmentSchema } from "@/lib/zodSchemas";

export default function DepartmentsPage() {
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
    editingDepartment,
    setEditingDepartment,
  } = useDepartmentStore();

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sortBy, sortOrder, setPage]);

  // ✅ CRUD hook tái sử dụng
  const {
    data,
    isLoading,
    isError,
    addMutation,
    updateMutation,
    deleteMutation,
  } = useCRUD<Department, DepartmentFormInputs>({
    resource: "departments",
    idField: "department_id",
    page,
    pageSize,
    search: debouncedSearch,
    sortBy: sortBy || "department_id",
    sortOrder,
  });

  const formAdd = useForm<DepartmentFormInputs>({
    resolver: zodResolver(departmentSchema),
    defaultValues: { department_name: "", department_code: "" },
  });

  const formEdit = useForm<DepartmentFormInputs>({
    resolver: zodResolver(departmentSchema),
  });

  const onSubmitAdd = (dataForm: DepartmentFormInputs) => {
    addMutation.mutate(dataForm, {
      onSuccess: () => {
        toast.success("Thêm khoa thành công");
        formAdd.reset();
        setAddOpen(false);
      },
      onError: () => toast.error("Thêm khoa thất bại"),
    });
  };

  const handleEdit = (dep: Department) => {
    setEditingDepartment(dep);
    formEdit.reset({
      department_name: dep.department_name,
      department_code: dep.department_code,
    });
  };

  const handleUpdate = (dataForm: DepartmentFormInputs) => {
    if (editingDepartment) {
      updateMutation.mutate(
        { ...editingDepartment, ...dataForm },
        {
          onSuccess: () => {
            toast.success("Cập nhật khoa thành công");
            formEdit.reset();
            setEditingDepartment(null);
          },
          onError: () => toast.error("Cập nhật thất bại"),
        }
      );
    }
  };

  const totalPages = data ? Math.ceil(data.total / pageSize) : 1;

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <ControlPanelDepartment
        total={data?.total ?? 0}
        addLabel="Thêm Khoa"
        addTotal="Tổng số khoa"
        onAdd={() => setAddOpen(true)}
      />

      <main className="flex-1 overflow-x-auto px-6 py-4">
        {isLoading && <p>Đang tải dữ liệu...</p>}
        {isError && <p>Lỗi tải danh sách khoa.</p>}

        {!isLoading && !isError && (
          <>
            <DataTable
              columns={[
                { key: "department_id", header: "ID" },
                { key: "department_code", header: "Mã khoa" },
                { key: "department_name", header: "Tên khoa" },
                {
                  key: "actions",
                  header: "Actions",
                  render: (dep: Department) => (
                    <div className="space-x-2">
                      <Button variant="default" onClick={() => handleEdit(dep)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <ConfirmDialog
                        onConfirm={() =>
                          deleteMutation.mutate(dep.department_id)
                        }
                        title="Bạn đã chắc chắn"
                        description="Khoa này sẽ bị xóa vĩnh viễn và không thể hoàn tác."
                      />
                    </div>
                  ),
                },
              ]}
              data={data?.items || []}
              emptyMessage="Không có khoa nào được tìm thấy"
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
            <DialogTitle>Thêm khoa mới</DialogTitle>
          </DialogHeader>

          <form onSubmit={formAdd.handleSubmit(onSubmitAdd)} className="space-y-4">
            <div>
              <Label className="mb-2">Mã khoa</Label>
              <Input {...formAdd.register("department_code")} placeholder="VD: CNTT" />
              {formAdd.formState.errors.department_code && (
                <p className="text-xs text-red-500">
                  {formAdd.formState.errors.department_code.message}
                </p>
              )}
            </div>

            <div>
              <Label className="mb-2">Tên khoa</Label>
              <Input {...formAdd.register("department_name")} placeholder="VD: Công nghệ thông tin" />
              {formAdd.formState.errors.department_name && (
                <p className="text-xs text-red-500">
                  {formAdd.formState.errors.department_name.message}
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
        open={!!editingDepartment}
        onOpenChange={(open) => {
          if (!open) setEditingDepartment(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa khoa</DialogTitle>
          </DialogHeader>

          <form onSubmit={formEdit.handleSubmit(handleUpdate)} className="space-y-4">
            <div>
              <Label className="mb-2">Mã khoa</Label>
              <Input {...formEdit.register("department_code")} />
              {formEdit.formState.errors.department_code && (
                <p className="text-xs text-red-500">
                  {formEdit.formState.errors.department_code.message}
                </p>
              )}
            </div>

            <div>
              <Label className="mb-2">Tên khoa</Label>
              <Input {...formEdit.register("department_name")} />
              {formEdit.formState.errors.department_name && (
                <p className="text-xs text-red-500">
                  {formEdit.formState.errors.department_name.message}
                </p>
              )}
            </div>

            <DialogFooter className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={() => setEditingDepartment(null)}>
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
