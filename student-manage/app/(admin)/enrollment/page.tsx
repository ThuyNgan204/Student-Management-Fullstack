"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, Pencil } from "lucide-react";

import DataTable from "@/components/shared/DataTable";
import Pagination from "@/components/shared/Pagination";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import DetailDialog from "@/components/shared/DetailModal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import EnrollmentDetail from "@/components/enrollment/EnrollmentDetail";
import { useEnrollmentStore, Enrollment } from "@/store/useEnrollmentStore";
import { useDebounce } from "@/hooks/useDebounce";
import { useCRUD } from "@/hooks/useCRUD";
import ControlPanelEnrollment from "@/components/enrollment/EnrollmentControlPanel";
import { EnrollmentFormInputs, enrollmentSchema } from "@/lib/zodSchemas";

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

  const totalPages = data ? Math.ceil(data.total / pageSize) : 1;

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <ControlPanelEnrollment
        total={data?.total ?? 0}
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
                  render: (r: Enrollment) => (
                    <div className="space-x-2">
                      <Button variant="ghost" onClick={() => handleView(r.enrollment_id)}>
                        <Eye className="size-4" />
                      </Button>
                      <Button variant="ghost" onClick={() => handleEdit(r)}>
                        <Pencil className="size-4" />
                      </Button>
                      <ConfirmDialog
                        onConfirm={() => deleteMutation.mutate(r.enrollment_id)}
                        title="Bạn đã chắc chắn?"
                        description="Học phần đã đăng kí sẽ bị xóa vĩnh viễn và không thể hoàn tác."
                      />
                    </div>
                  ),
                },
              ]}
              data={data?.items || []}
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

          <form onSubmit={formAdd.handleSubmit(onSubmitAdd)} className="space-y-4">
            <div>
              <Label className="mb-2">Sinh viên</Label>
              <select
                {...formAdd.register("student_id", { valueAsNumber: true })}
                defaultValue={0}
                className={`border rounded px-2 py-1 w-full ${formAdd.formState.errors.student_id ? "border-red-500" : ""}`}
              >
                <option value={0} disabled>Chọn sinh viên</option>
                {students.map((s: any) => (
                  <option key={s.student_id} value={s.student_id}>
                    {s.student_code} — {s.last_name} {s.first_name}
                  </option>
                ))}
              </select>
              {formAdd.formState.errors.student_id?.message && (
                <p className="text-red-500 text-sm mt-1">
                  {String(formAdd.formState.errors.student_id.message)}
                </p>
              )}
            </div>

            <div>
              <Label className="mb-2">Lớp học phần</Label>
              <select
                {...formAdd.register("class_section_id", { valueAsNumber: true })}
                defaultValue={0}
                className={`border rounded px-2 py-1 w-full ${formAdd.formState.errors.class_section_id ? "border-red-500" : ""}`}
              >
                <option value={0} disabled>Chọn lớp học phần</option>
                {classSections.map((c: any) => (
                  <option key={c.class_section_id} value={c.class_section_id}>
                    {c.section_code} — {c.courses?.course_code} {c.courses?.course_name}
                  </option>
                ))}
              </select>
              {formAdd.formState.errors.class_section_id?.message && (
                <p className="text-red-500 text-sm mt-1">
                  {String(formAdd.formState.errors.class_section_id.message)}
                </p>
              )}
            </div>

            <div>
              <Label className="mb-2">Trạng thái</Label>
              <select {...formAdd.register("status")} defaultValue="Đang học" className="border rounded px-2 py-1 w-full">
                <option>Đang học</option>
                <option>Hoàn thành</option>
                <option>Hủy</option>
              </select>
            </div>

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
              <select
                {...formEdit.register("student_id", { valueAsNumber: true })}
                defaultValue={editingEnrollment?.student_id ?? 0}
                className={`border rounded px-2 py-1 w-full ${formEdit.formState.errors.student_id ? "border-red-500" : ""}`}
              >
                <option value={0} disabled>Chọn sinh viên</option>
                {students.map((s: any) => (
                  <option key={s.student_id} value={s.student_id}>
                    {s.student_code} — {s.last_name} {s.first_name}
                  </option>
                ))}
              </select>
              {formEdit.formState.errors.student_id?.message && (
                <p className="text-red-500 text-sm mt-1">
                  {String(formEdit.formState.errors.student_id.message)}
                </p>
              )}
            </div>

            <div>
              <Label className="mb-2">Lớp học phần</Label>
              <select
                {...formEdit.register("class_section_id", { valueAsNumber: true })}
                defaultValue={editingEnrollment?.class_section_id ?? 0}
                className={`border rounded px-2 py-1 w-full ${formEdit.formState.errors.class_section_id ? "border-red-500" : ""}`}
              >
                <option value={0} disabled>Chọn lớp học phần</option>
                {classSections.map((c: any) => (
                  <option key={c.class_section_id} value={c.class_section_id}>
                    {c.section_code} — {c.courses?.course_code} {c.courses?.course_name}
                  </option>
                ))}
              </select>
              {formEdit.formState.errors.class_section_id?.message && (
                <p className="text-red-500 text-sm mt-1">
                  {String(formEdit.formState.errors.class_section_id.message)}
                </p>
              )}
            </div>

            <div>
              <Label className="mb-2">Trạng thái</Label>
              <select {...formEdit.register("status")} className="border rounded px-2 py-1 w-full" defaultValue={editingEnrollment?.status ?? "Đang học"}>
                <option>Đang học</option>
                <option>Hoàn thành</option>
                <option>Hủy</option>
              </select>
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
