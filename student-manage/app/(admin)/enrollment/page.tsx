"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import ConfirmDialog from "@/components/shared/ConfirmDialog";
import DataTable from "@/components/shared/DataTable";
import DetailDialog from "@/components/shared/DetailModal";
import Pagination from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import ControlPanelEnrollment from "@/components/enrollment/EnrollmentControlPanel";
import EnrollmentDetail from "@/components/enrollment/EnrollmentDetail";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCRUD } from "@/hooks/useCRUD";
import { useDebounce } from "@/hooks/useDebounce";
import { EnrollmentFormInputs, enrollmentSchema } from "@/lib/zodSchemas";
import { Enrollment, useEnrollmentStore } from "@/store/useEnrollmentStore";

export default function EnrollmentsPage() {
  const {
    page,
    pageSize,
    search,
    setPage,
    sortBy,
    sortOrder,
    studentFilters,
    classSectionFilters,
    statusFilters,
    addOpen,
    setAddOpen,
    editingEnrollment,
    setEditingEnrollment,
    selectedEnrollment,
    setSelectedEnrollment,
  } = useEnrollmentStore();

  const debouncedSearch = useDebounce(search, 500);

  // fetch lists for dropdowns
  const [students, setStudents] = useState<any[]>([]);
  const [classSections, setClassSections] = useState<any[]>([]);

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const [sRes, cRes] = await Promise.all([
          axios.get("/api/students", { params: { page: 1, page_size: 1000, sort_order: 'asc' } }),
          axios.get("/api/class_section", { params: { page: 1, page_size: 1000 } }),
        ]);
        // adapt shape: some endpoints return { items, total } or { data }
        setStudents(sRes.data.items || sRes.data.data || sRes.data);
        setClassSections(cRes.data.items || cRes.data.data || cRes.data);
      } catch (err) {
        console.error("Load students/class sections failed", err);
      }
    };
    fetchLists();
  }, []);

  const {
    data,
    isLoading,
    isError,
    addMutation,
    updateMutation,
    deleteMutation,
    refetch,
  } = useCRUD<Enrollment, EnrollmentFormInputs>({
    resource: "enrollment",
    idField: "enrollment_id",
    page,
    pageSize,
    search: debouncedSearch,
    sortBy: sortBy || "enrollment_id",
    sortOrder,
    filters: {
      student_id: studentFilters,
      class_section_id: classSectionFilters,
      status: statusFilters,
    },
    // NOTE: useCRUD in your codebase must support `filters` as above.
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, studentFilters, classSectionFilters, statusFilters, setPage]);

  // forms
  const formAdd = useForm<EnrollmentFormInputs>({
    resolver: zodResolver(enrollmentSchema),
    // set numeric defaults to 0 to avoid converting "" -> NaN
    defaultValues: { student_id: 0 as any, class_section_id: 0 as any, status: "Đang học" },
  });

  const formEdit = useForm<EnrollmentFormInputs>({
    resolver: zodResolver(enrollmentSchema),
  });

  const onSubmitAdd = (values: EnrollmentFormInputs) => {
    addMutation.mutate(
      values,
      {
        onSuccess: () => {
          toast.success("Đăng kí học phần thành công");
          formAdd.reset();
          setAddOpen(false);
          refetch?.();
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.error || "Đăng kí học phần thất bại");
        },
      }
    );
  };

  const handleEdit = (en: Enrollment) => {
    setEditingEnrollment(en);
    formEdit.reset({
      student_id: en.student_id,
      class_section_id: en.class_section_id,
      status: en.status,
    });
  };

  const handleUpdate = (values: EnrollmentFormInputs) => {
    if (!editingEnrollment) return;
    updateMutation.mutate(
      { ...editingEnrollment, ...values },
      {
        onSuccess: () => {
          toast.success("Cập nhật học phần đã đăng kí thành công");
          setEditingEnrollment(null);
          refetch?.();
        },
        onError: () => toast.error("Cập nhật thất bại"),
      }
    );
  };

  const handleView = async (id: number) => {
    try {
      const res = await axios.get(`/api/enrollment/${id}`);
      setSelectedEnrollment(res.data);
    } catch (err) {
      toast.error("Không tải được chi tiết học phần đã đăng kí");
    }
  };

  const { items: enrollment = [], total = 0 } = data ?? {};
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <ControlPanelEnrollment
        total={total}
        students={students}
        classSections={classSections}
        onAdd={() => setAddOpen(true)}
      />

      <main className="flex-1 overflow-x-auto px-6 py-4">
        {isLoading && <p>Đang tải...</p>}
        {isError && <p>Tải danh sách học phần đã đăng kí thất bại.</p>}

        {!isLoading && !isError && (
          <>
            <DataTable
              columns={[
                { key: "enrollment_id", header: "ID" },
                {
                  key: "students",
                  header: "Sinh viên",
                  render: (r: any) =>
                    r.students ? `${r.students.student_code} — ${r.students.last_name} ${r.students.first_name}` : "N/A",
                },
                {
                  key: "class_section",
                  header: "Lớp học phần",
                  render: (r: any) => r.class_section ? r.class_section.section_code : "N/A",
                },
                {
                  key: "course",
                  header: "Học phần",
                  render: (r: any) => r.class_section?.courses ? `${r.class_section.courses.course_code} - ${r.class_section.courses.course_name}` : "N/A",
                },
                { key: "status", header: "Trạng thái" },
                {
                  key: "actions",
                  header: "Thao tác",
                  className: "text-center",
                  render: (r: Enrollment) => (
                    <div className="flex justify-center space-x-2 gap-2">
                      <button
                        className="text-blue-400 hover:text-blue-800 cursor-pointer transition-colors"
                        onClick={() => handleView(r.enrollment_id)}
                      >
                        <Eye className="size-4" />
                      </button>
                      <button
                        className="text-gray-500 hover:text-yellow-600 cursor-pointer transition-colors"
                        onClick={() => handleEdit(r)}
                      >
                        <Pencil className="size-4" />
                      </button>
                      <ConfirmDialog
                        onConfirm={() =>
                          deleteMutation.mutate(r.enrollment_id, {
                            onSuccess: () => {
                              toast.success('Xóa học phần đã đăng ký thành công!');
                            },
                            onError: () => {
                              toast.error('Xóa học phần đã đăng ký thất bại!');
                            },
                          })
                        }
                        title="Bạn đã chắc chắn?"
                        description="Học phần đã đăng kí sẽ bị xóa vĩnh viễn và không thể hoàn tác."
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
              data={enrollment}
              emptyMessage="Không có học phần nào đã được đăng kí"
            />

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </main>

      {/* ADD DIALOG */}
      <Dialog
        open={addOpen}
        onOpenChange={(open) => {
          if (!open) formAdd.reset();
          setAddOpen(open);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Đăng kí học phần</DialogTitle>
          </DialogHeader>

          <form 
            onSubmit={formAdd.handleSubmit(onSubmitAdd)} 
            className="space-y-4"
          >
            <div>
              <Label className="mb-2">Sinh viên</Label>
              <Select onValueChange={(value) => formAdd.setValue("student_id", Number(value))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn sinh viên" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {students.map((s) => (
                    <SelectItem key={s.student_id} value={s.student_id.toString()}>
                      {s.student_code} — {s.last_name} {s.first_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formAdd.formState.errors.student_id?.message && (
                <p className="text-red-500 text-sm mt-1">
                  {String(formAdd.formState.errors.student_id.message)}
                </p>
              )}
            </div>

            <div>
              <Label className="mb-2">Lớp học phần</Label>
              <Select onValueChange={(value) => formAdd.setValue("class_section_id", Number(value))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn lớp học phần" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {classSections.map((c) => (
                    <SelectItem key={c.class_section_id} value={c.class_section_id.toString()}>
                      {c.section_code} — {c.courses?.course_code} {c.courses?.course_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formAdd.formState.errors.class_section_id?.message && (
                <p className="text-red-500 text-sm mt-1">
                  {String(formAdd.formState.errors.class_section_id.message)}
                </p>
              )}
            </div>

            {/* <div>
              <Label className="mb-2">Trạng thái</Label>
              <Select onValueChange={(value) => formAdd.setValue("status", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Trạng thái sinh viên" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Đang học">Đang học</SelectItem>
                  <SelectItem value="Bảo lưu">Bảo lưu</SelectItem>
                  <SelectItem value="Tốt nghiệp">Tốt nghiệp</SelectItem>
                </SelectContent>
              </Select>
            </div> */}

            <DialogFooter className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={() => { formAdd.reset(); setAddOpen(false); }}>Đóng</Button>
              <Button type="submit">Lưu</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={!!editingEnrollment} onOpenChange={(open) => { if (!open) setEditingEnrollment(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa học phần đã đăng kí</DialogTitle>
          </DialogHeader>

          <form onSubmit={formEdit.handleSubmit(handleUpdate)} className="space-y-4">
            <div>
              <Label className="mb-2">Sinh viên</Label>
              <Select
                defaultValue={
                  editingEnrollment?.student_id
                    ? String(editingEnrollment.student_id)
                    : undefined
                }
                onValueChange={(value) =>
                  formEdit.setValue("student_id", Number(value))
                }
              >
                <SelectTrigger
                  className={`w-full border rounded px-2 py-1 ${
                    formEdit.formState.errors.student_id ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Chọn sinh viên" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s: any) => (
                    <SelectItem
                      key={s.student_id}
                      value={String(s.student_id)}
                    >
                      {s.student_code} — {s.last_name} {s.first_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formEdit.formState.errors.student_id?.message && (
                <p className="text-red-500 text-sm mt-1">
                  {String(formEdit.formState.errors.student_id.message)}
                </p>
              )}
            </div>

            <div>
              <Label className="mb-2">Lớp học phần</Label>
              <Select
                defaultValue={
                  editingEnrollment?.class_section_id
                    ? String(editingEnrollment.class_section_id)
                    : undefined
                }
                onValueChange={(value) =>
                  formEdit.setValue("class_section_id", Number(value))
                }
              >
                <SelectTrigger
                  className={`w-full border rounded px-2 py-1 ${
                    formEdit.formState.errors.class_section_id ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Chọn lớp học phần" />
                </SelectTrigger>

                <SelectContent>
                  {classSections.map((c: any) => (
                    <SelectItem
                      key={c.class_section_id}
                      value={String(c.class_section_id)}
                    >
                      {c.section_code} — {c.courses?.course_code} {c.courses?.course_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formEdit.formState.errors.class_section_id?.message && (
                <p className="text-red-500 text-sm mt-1">
                  {String(formEdit.formState.errors.class_section_id.message)}
                </p>
              )}
            </div>

            <div>
              <Label className="mb-2">Trạng thái</Label>
              <Select
                defaultValue={editingEnrollment?.status ?? "Đang học"}
                onValueChange={(value) => formEdit.setValue("status", value)}
              >
                <SelectTrigger className="border rounded px-2 py-1 w-full">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="Đang học">Đang học</SelectItem>
                  <SelectItem value="Hoàn thành">Hoàn thành</SelectItem>
                  <SelectItem value="Hủy">Hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={() => setEditingEnrollment(null)}>Đóng</Button>
              <Button type="submit">Cập nhật</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail */}
      <DetailDialog open={!!selectedEnrollment} title="Chi tiết học phần đã đăng kí" onClose={() => setSelectedEnrollment(null)}>
        {selectedEnrollment && <EnrollmentDetail enrollment={selectedEnrollment} />}
      </DetailDialog>
    </div>
  );
}
