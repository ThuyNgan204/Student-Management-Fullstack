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
import { useCourseStore, Course } from "@/store/useCourseStore";
import { Department } from "@/store/useDepartmentStore";
import { CourseFormInputs, courseSchema } from "@/lib/zodSchemas";
import ControlPanelCourse from "@/components/courses/Courses-ControlPanel";

export default function CoursesPage() {
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
    editingCourse,
    setEditingCourse,
  } = useCourseStore();

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
  } = useCRUD<Course, CourseFormInputs>({
    resource: "courses",
    idField: "course_id",
    page,
    pageSize,
    search: debouncedSearch,
    sortBy: sortBy || "course_id",
    sortOrder,
    filters: {
      department: departmentFilters,
    },
  });

  // 🔹 Danh sách khoa để select
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    axios
      .get("/api/departments")
      .then((res) => setDepartments(res.data.items || []))
      .catch(() => toast.error("Không thể tải danh sách khoa"));
  }, []);

  // 🔹 Form thêm học phần
  const formAdd = useForm<CourseFormInputs>({
    resolver: zodResolver(courseSchema),
    defaultValues: { course_name: "", course_code: "", credits: 3, department_id: 0 },
  });

  // 🔹 Form chỉnh sửa học phần
  const formEdit = useForm<CourseFormInputs>({
    resolver: zodResolver(courseSchema),
  });

  const onSubmitAdd = (dataForm: CourseFormInputs) => {
    addMutation.mutate(dataForm, {
      onSuccess: () => {
        toast.success("Thêm học phần thành công");
        formAdd.reset();
        setAddOpen(false);
      },
      onError: () => toast.error("Thêm học phần thất bại"),
    });
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    formEdit.reset({
      course_name: course.course_name,
      course_code: course.course_code,
      credits: course.credits,
      department_id: course.department_id,
    });
  };

  const handleUpdate = (dataForm: CourseFormInputs) => {
    if (editingCourse) {
      updateMutation.mutate(
        { ...editingCourse, ...dataForm },
        {
          onSuccess: () => {
            toast.success("Cập nhật học phần thành công");
            formEdit.reset();
            setEditingCourse(null);
          },
          onError: () => toast.error("Cập nhật thất bại"),
        }
      );
    }
  };

  const totalPages = data ? Math.ceil(data.total / pageSize) : 1;

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <ControlPanelCourse
        total={data?.total ?? 0}
        addLabel="Thêm học phần"
        addTotal="Tổng số học phần"
        onAdd={() => setAddOpen(true)}
      />

      <main className="flex-1 overflow-x-auto px-6 py-4">
        {isLoading && <p>Đang tải dữ liệu...</p>}
        {isError && <p>Lỗi tải danh sách học phần.</p>}

        {!isLoading && !isError && (
          <>
            <DataTable
              columns={[
                { key: "course_id", header: "ID" },
                { key: "course_name", header: "Tên học phần" },
                { key: "course_code", header: "Mã học phần" },
                { key: "credits", header: "Số tín chỉ" },
                {
                  key: "department.department_name",
                  header: "Khoa quản lý",
                  render: (c: Course) => c.departments?.department_name || "-",
                },
                {
                  key: "actions",
                  header: "Thao tác",
                  className: "text-center",
                  render: (c: Course) => (
                    <div className="flex justify-center space-x-2 gap-2">
                      <button
                        className="text-gray-500 hover:text-yellow-600 cursor-pointer transition-colors"
                        onClick={() => handleEdit(c)}
                      >
                        <Pencil className="size-4" />
                      </button>
                      <ConfirmDialog
                        onConfirm={() => deleteMutation.mutate(c.course_id)}
                        title="Bạn đã chắc chắn?"
                        description="Học phần này sẽ bị xóa vĩnh viễn và không thể hoàn tác."
                        trigger={
                          <button
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={16} />
                          </button>
                        }
                      />
                    </div>
                  ),
                },
              ]}
              data={data?.items || []}
              emptyMessage="Không có học phần nào được tìm thấy"
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
            <DialogTitle>Thêm học phần mới</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={formAdd.handleSubmit(onSubmitAdd)}
            className="space-y-4"
          >
            <div>
              <Label className="mb-2">Mã học phần</Label>
              <Input {...formAdd.register("course_code")} />
              {formAdd.formState.errors.course_code && (
                <p className="text-xs text-red-500">
                  {formAdd.formState.errors.course_code.message}
                </p>
              )}
            </div>

            <div>
              <Label className="mb-2">Tên học phần</Label>
              <Input {...formAdd.register("course_name")} />
              {formAdd.formState.errors.course_name && (
                <p className="text-xs text-red-500">
                  {formAdd.formState.errors.course_name.message}
                </p>
              )}

            </div>

            <div>
              <Label className="mb-2">Số tín chỉ</Label>
              <Input type="number" {...formAdd.register("credits", { valueAsNumber: true })} />
              {formAdd.formState.errors.credits && (
                <p className="text-xs text-red-500">
                  {formAdd.formState.errors.credits.message}
                </p>
              )}
            </div>

            <div>
              <Label className="mb-2">Khoa quản lý</Label>
              <select
                {...formAdd.register("department_id", { valueAsNumber: true })}
                className="border rounded-md px-3 py-2 w-full bg-white shadow-sm"
              >
                <option value="" disabled>Chọn khoa</option>
                {departments.map((dep) => (
                  <option key={dep.department_id} value={dep.department_id}>
                    {dep.department_name}
                  </option>
                ))}
              </select>
              {formAdd.formState.errors.department_id && (
                <p className="text-xs text-red-500">
                  {formAdd.formState.errors.department_id.message}
                </p>
              )}
            </div>

            <DialogFooter className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={() => setAddOpen(false)}>
                Đóng
              </Button>
              <Button type="submit">Lưu</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT MODAL */}
      <Dialog
        open={!!editingCourse}
        onOpenChange={(open) => {
          if (!open) setEditingCourse(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa học phần</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={formEdit.handleSubmit(handleUpdate)}
            className="space-y-4"
          >
            <div>
              <Label className="mb-2">Mã học phần</Label>
              <Input {...formEdit.register("course_code")} />
              {formAdd.formState.errors.course_code && (
                <p className="text-xs text-red-500">
                  {formAdd.formState.errors.course_code.message}
                </p>
              )}
            </div>

            <div>
              <Label className="mb-2">Tên học phần</Label>
              <Input {...formEdit.register("course_name")} />
              {formAdd.formState.errors.course_name && (
                <p className="text-xs text-red-500">
                  {formAdd.formState.errors.course_name.message}
                </p>
              )}
            </div>

            <div>
              <Label className="mb-2">Số tín chỉ</Label>
              <Input type="number" {...formEdit.register("credits", { valueAsNumber: true })} />
              {formAdd.formState.errors.credits && (
                <p className="text-xs text-red-500">
                  {formAdd.formState.errors.credits.message}
                </p>
              )}
            </div>

            <div>
              <Label className="mb-2">Khoa quản lý</Label>
              <select
                {...formEdit.register("department_id", { valueAsNumber: true })}
                className="border rounded-md px-3 py-2 w-full bg-white shadow-sm"
              >
                <option value="" disabled>Chọn khoa</option>
                {departments.map((dep) => (
                  <option key={dep.department_id} value={dep.department_id}>
                    {dep.department_name}
                  </option>
                ))}
              </select>
              {formAdd.formState.errors.department_id && (
                <p className="text-xs text-red-500">
                  {formAdd.formState.errors.department_id.message}
                </p>
              )}
            </div>

            <DialogFooter className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={() => setEditingCourse(null)}>
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
