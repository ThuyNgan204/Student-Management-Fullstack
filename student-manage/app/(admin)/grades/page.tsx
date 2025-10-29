"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";

import DataTable from "@/components/shared/DataTable";
import Pagination from "@/components/shared/Pagination";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { useGradeStore, Grade } from "@/store/useGradeStore";
import { GradeFormInputs, gradeSchema } from "@/lib/zodSchemas";
import { useCRUD } from "@/hooks/useCRUD";
import { useDebounce } from "@/hooks/useDebounce";
import ControlPanelGrade from "@/components/grades/ControlPanelGrade";
import Link from "next/link";

export default function GradePage() {
  const {
    page,
    pageSize,
    search,
    studentFilters,
    classSectionFilters,
    academicClassFilters,
    setPage,
    sortBy,
    sortOrder,
    addOpen,
    setAddOpen,
    editingGrade,
    setEditingGrade,
  } = useGradeStore();

  const debouncedSearch = useDebounce(search, 500);

  const [students, setStudents] = useState<any[]>([]);
  const [classSections, setClassSections] = useState<any[]>([]); // ✅ Thêm mới
  const [enrollment, setEnrollment] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [academicClasses, setAcademicClasses] = useState<any[]>([]);

  // ✅ Load danh sách sinh viên
  useEffect(() => {
    axios
      .get("/api/students", { params: { page: 1, page_size: 1000 } })
      .then((res) => setStudents(res.data.items || res.data))
      .catch(() => toast.error("Không tải được danh sách sinh viên"));
  }, []);

  // ✅ Load toàn bộ class_section để filter riêng
  useEffect(() => {
    axios
      .get("/api/class_section", { params: { page: 1, page_size: 1000 } })
      .then((res) => setClassSections(res.data.items || res.data))
      .catch(() => toast.error("Không tải được danh sách lớp học phần"));
  }, []);

  // ✅ Load toàn bộ lớp sinh hoạt
  useEffect(() => {
    axios
      .get("/api/academic_class", { params: { page: 1, page_size: 1000 } })
      .then((res) => setAcademicClasses(res.data.items || res.data))
      .catch(() => toast.error("Không tải được danh sách lớp sinh hoạt"));
  }, []);

  // ✅ Khi chọn sinh viên → load học phần riêng để dùng cho form Add
  useEffect(() => {
    if (!selectedStudent) {
      setEnrollment([]);
      return;
    }
    axios
      .get("/api/enrollment", { params: { student_id: selectedStudent } })
      .then((res) => setEnrollment(res.data.items || res.data))
      .catch(() => toast.error("Không tải được danh sách học phần của sinh viên"));
  }, [selectedStudent]);

  // ✅ CRUD
  const {
    data,
    isLoading,
    addMutation,
    updateMutation,
    deleteMutation,
    refetch,
  } = useCRUD<Grade, GradeFormInputs>({
    resource: "grades",
    idField: "grade_id",
    page,
    pageSize,
    search: debouncedSearch,
    sortBy,
    sortOrder,
    filters: {
      student_id: studentFilters,
      class_section_id: classSectionFilters,
      academic_class_id: academicClassFilters,
    },
  });

  // ✅ Form thêm
  const formAdd = useForm<GradeFormInputs>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      enrollment_id: undefined as any,
      attendance_score: 0,
      midterm_score: 0,
      assignment_score: 0,
      final_score: 0,
    },
  });

  // ✅ Form sửa
  const formEdit = useForm<GradeFormInputs>({
    resolver: zodResolver(gradeSchema),
  });

  const onSubmitAdd = (values: GradeFormInputs) => {
    addMutation.mutate(values, {
      onSuccess: () => {
        toast.success("Thêm điểm thành công");
        formAdd.reset();
        setAddOpen(false);
        refetch?.();
      },
      onError: () => toast.error("Thêm điểm thất bại"),
    });
  };

  const handleEdit = (g: Grade) => {
    setEditingGrade(g);
    formEdit.reset({
      enrollment_id: g.enrollment_id,
      attendance_score: g.attendance_score,
      midterm_score: g.midterm_score,
      assignment_score: g.assignment_score,
      final_score: g.final_score,
    });
  };

  const handleUpdate = (values: GradeFormInputs) => {
    if (!editingGrade) return;
    updateMutation.mutate(
      { ...editingGrade, ...values },
      {
        onSuccess: () => {
          toast.success("Cập nhật điểm thành công");
          setEditingGrade(null);
          refetch?.();
        },
        onError: () => toast.error("Cập nhật thất bại"),
      }
    );
  };

  const { items: grades = [], total = 0 } = data ?? {};
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ FILTER HOÀN CHỈNH */}
      <ControlPanelGrade
        total={total}
        students={students}
        classSections={classSections} // ✅ Dùng danh sách đầy đủ
        academicClasses={academicClasses} 
        onAdd={() => setAddOpen(true)}
      />

      <main className="flex-1 overflow-x-auto px-6 py-4">
        {isLoading ? (
          <p>Đang tải...</p>
        ) : (
          <>
            <DataTable
              columns={[
                { key: "grade_id", header: "ID" },
                {
                  key: "student",
                  header: "Sinh viên",
                  render: (r: Grade) => {
                    const s = r.enrollment?.students;
                    if (!s) return "N/A";
                    return (
                      <Link
                        href={`/students/${s.student_id}/grades`}
                        className="flex flex-col leading-tight hover:underline"
                      >
                        <span>{`${s.last_name} ${s.first_name}`}</span>
                        <span className="text-gray-500 text-xs">{s.student_code}</span>
                      </Link>
                    );
                  },
                },
                {
                  key: "class_section",
                  header: "Lớp học phần",
                  render: (r: Grade) => {
                    const section = r.enrollment?.class_section;
                    const course = section?.courses;

                    if (!section || !course) return "N/A";

                    return (
                      <div className="flex flex-col leading-tight">
                        <span>{section.section_code}</span>
                        <span className="text-gray-600 text-xs">{course.course_name}</span>
                      </div>
                    );
                  },
                },
                {
                  key: "credits",
                  header: "Số TC",
                  render: (r: Grade) => {
                    const credits = r.enrollment?.class_section?.courses?.credits;
                    return credits ?? "N/A";
                  },
                },
                { key: "attendance_score", header: "Chuyên cần" },
                { key: "midterm_score", header: "Giữa kỳ" },
                { key: "assignment_score", header: "Bài tập" },
                { key: "final_score", header: "Cuối kỳ" },
                { key: "total_score", header: "Tổng" },
                { key: "letter_grade", header: "Loại" },
                { key: "status", header: "Trạng thái" },
                {
                  key: "actions",
                  header: "Thao tác",
                  className: "text-center",
                  render: (r: Grade) => (
                    <div className="flex justify-center space-x-2 gap-2">
                      <button
                        className="text-gray-500 hover:text-yellow-600 cursor-pointer transition-colors"
                        onClick={() => handleEdit(r)}
                      >
                        <Pencil className="size-4" />
                      </button>
                      <ConfirmDialog
                        onConfirm={() => deleteMutation.mutate(r.grade_id)}
                        title="Xóa điểm này?"
                        description="Hành động này không thể hoàn tác."
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
              data={grades}
              emptyMessage="Không có dữ liệu điểm"
            />

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </main>

      {/* ADD DIALOG */}
      <Dialog open={addOpen} onOpenChange={(o) => setAddOpen(o)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Thêm điểm</DialogTitle>
          </DialogHeader>

          <form onSubmit={formAdd.handleSubmit(onSubmitAdd)} className="space-y-4">
            {/* Chọn sinh viên */}
            <div>
              <Label>Sinh viên</Label>
              <select
                value={selectedStudent ?? ""}
                onChange={(e) =>
                  setSelectedStudent(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                className="border rounded w-full px-2 py-1"
              >
                <option value="">Chọn sinh viên</option>
                {students.map((s) => (
                  <option key={s.student_id} value={s.student_id}>
                    {s.student_code} - {s.last_name} {s.first_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Chọn học phần */}
            <div>
              <Label>Học phần</Label>
              <select
                {...formAdd.register("enrollment_id", { valueAsNumber: true })}
                disabled={!selectedStudent}
                className="border rounded w-full px-2 py-1"
              >
                <option value="" disabled>Chọn học phần</option>
                {enrollment.map((e) => (
                  <option key={e.enrollment_id} value={e.enrollment_id}>
                    {e.class_section?.section_code ?? "??"} -{" "}
                    {e.class_section?.courses?.course_code ?? "??"} -{" "}
                    {e.class_section?.courses?.course_name ?? "Không rõ"}
                  </option>
                ))}
              </select>
            </div>

            {/* Nhập điểm */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Chuyên cần</Label>
                <input
                  type="number"
                  step="0.1"
                  {...formAdd.register("attendance_score")}
                  className="border rounded w-full px-2 py-1"
                />
              </div>
              <div>
                <Label>Giữa kỳ</Label>
                <input
                  type="number"
                  step="0.1"
                  {...formAdd.register("midterm_score")}
                  className="border rounded w-full px-2 py-1"
                />
              </div>
              <div>
                <Label>Bài tập</Label>
                <input
                  type="number"
                  step="0.1"
                  {...formAdd.register("assignment_score")}
                  className="border rounded w-full px-2 py-1"
                />
              </div>
              <div>
                <Label>Cuối kỳ</Label>
                <input
                  type="number"
                  step="0.1"
                  {...formAdd.register("final_score")}
                  className="border rounded w-full px-2 py-1"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setAddOpen(false)}>
                Hủy
              </Button>
              <Button type="submit">Lưu</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={!!editingGrade} onOpenChange={(o) => !o && setEditingGrade(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa điểm</DialogTitle>
          </DialogHeader>

          <form onSubmit={formEdit.handleSubmit(handleUpdate)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Chuyên cần</Label>
                <input
                  type="number"
                  step="0.1"
                  {...formEdit.register("attendance_score")}
                  className="border rounded w-full px-2 py-1"
                />
              </div>
              <div>
                <Label>Giữa kỳ</Label>
                <input
                  type="number"
                  step="0.1"
                  {...formEdit.register("midterm_score")}
                  className="border rounded w-full px-2 py-1"
                />
              </div>
              <div>
                <Label>Bài tập</Label>
                <input
                  type="number"
                  step="0.1"
                  {...formEdit.register("assignment_score")}
                  className="border rounded w-full px-2 py-1"
                />
              </div>
              <div>
                <Label>Cuối kỳ</Label>
                <input
                  type="number"
                  step="0.1"
                  {...formEdit.register("final_score")}
                  className="border rounded w-full px-2 py-1"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setEditingGrade(null)}>
                Hủy
              </Button>
              <Button type="submit">Cập nhật</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
