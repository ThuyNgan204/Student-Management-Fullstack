"use client";

import { useEffect, useMemo, useState } from "react";
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
import { useDebounce } from "@/hooks/useDebounce";
import { useCRUD } from "@/hooks/useCRUD";
import {
  ClassSectionFormInputs,
  classSectionSchema,
} from "@/lib/zodSchemas";
import {
  ClassSection,
  useClassSectionStore,
} from "@/store/useClassSectionStore";
import { Label } from "@/components/ui/label";
import ControlPanelClassSection from "@/components/class_section/Class_Section-ControlPanel";
import ClassSectionDetail from "@/components/class_section/ClassSectionDetail";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchParams, useRouter } from "next/navigation";
import { formatDate } from "@/utils/date";

export default function ClassSectionsPage() {
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
    editingSection,
    setEditingSection,
    selectedSection,
    setSelectedSection,
    semesterFilters,
  } = useClassSectionStore();

  const searchParams = useSearchParams();
  const router = useRouter();
  const lecturerId = searchParams.get("lecturer");
  const isLecturerView = Boolean(lecturerId);

  const [courses, setCourses] = useState<any[]>([]);
  const [lecturers, setLecturers] = useState<any[]>([]);

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    console.log("FULL URL:", window.location.href);
    console.log("lecturer param:", lecturerId);
  }, [lecturerId]);


  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sortBy, sortOrder, semesterFilters, setPage]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [coursesRes, lecturersRes] = await Promise.all([
          axios.get("/api/courses"),
          axios.get("/api/lecturers"),
        ]);
        setCourses(coursesRes.data.items || coursesRes.data);
        setLecturers(lecturersRes.data.items || lecturersRes.data);
      } catch (err) {
        console.error("Failed to load courses or lecturers", err);
      }
    };
    // always fetch these for selects (safe even in lecturer view)
    fetch();
  }, []);

  const filters = useMemo(
  () => ({
    semester: semesterFilters,
    ...(isLecturerView ? { lecturer: [Number(lecturerId)] } : {}), // 👈 phải là mảng
  }),
  [semesterFilters, isLecturerView, lecturerId]
);

const {
  data,
  isLoading,
  isError,
  addMutation,
  updateMutation,
  deleteMutation,
} = useCRUD<ClassSection, ClassSectionFormInputs>({
  resource: "class_section",
  idField: "class_section_id",
  page,
  pageSize,
  search: debouncedSearch,
  sortBy: sortBy || "class_section_id",
  sortOrder,
  filters,
});


  // ===== Form Add =====
  const formAdd = useForm<ClassSectionFormInputs>({
    resolver: zodResolver(classSectionSchema),
    defaultValues: {
      section_code: "",
      academic_year: "",
      semester: "",
      course_id: undefined,
      lecturer_id: undefined,
      capacity: 30,
      start_date: "",
      end_date: "",
    },
  });

  // ===== Form Edit =====
  const formEdit = useForm<ClassSectionFormInputs>({
    resolver: zodResolver(classSectionSchema),
  });

  const onSubmitAdd = (dataForm: ClassSectionFormInputs) => {
    addMutation.mutate(dataForm, {
      onSuccess: () => {
        toast.success("Thêm lớp học phần thành công");
        formAdd.reset();
        setAddOpen(false);
      },
      onError: () => toast.error("Thêm lớp học phần thất bại"),
    });
  };

  const handleEdit = (s: ClassSection) => {
    setEditingSection(s);
    formEdit.reset({
      section_code: s.section_code,
      academic_year: s.academic_year,
      semester: s.semester,
      course_id: s.course_id,
      lecturer_id: s.lecturer_id,
      capacity: s.capacity,
      start_date: s.start_date?.split("T")[0] ?? "",
      end_date: s.end_date?.split("T")[0] ?? "",
    });
  };

  const handleUpdate = (dataForm: ClassSectionFormInputs) => {
    if (editingSection) {
      updateMutation.mutate(
        { ...editingSection, ...dataForm },
        {
          onSuccess: () => {
            toast.success("Cập nhật lớp học phần thành công");
            formEdit.reset();
            setEditingSection(null);
          },
          onError: () => toast.error("Cập nhật thất bại"),
        }
      );
    }
  };

  const handleView = async (id: number) => {
    try {
      const res = await axios.get(`/api/class_section/${id}`);
      setSelectedSection(res.data);
    } catch (err) {
      toast.error("Không tải được chi tiết lớp học phần");
    }
  };

  const { items: class_section = [], total = 0 } = data ?? {};
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      {/* If viewing by lecturer, show a small header with back button + title */}
      {isLecturerView ? (
        <div className="px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            ← Quay lại
          </Button>
          <h2 className="text-lg font-semibold">Các lớp học phần đang giảng dạy</h2>
          <div className="w-24" />
        </div>
      ) : (
        // Control panel only when not in lecturer view
        <ControlPanelClassSection
          total={total}
          addLabel="Thêm lớp học phần"
          addTotal="Tổng lớp học phần"
          onAdd={() => setAddOpen(true)}
        />
      )}

      <main className="flex-1 overflow-x-auto px-6 py-4">
        {isLoading && <p>Đang tải...</p>}
        {isError && <p>Tải danh sách lớp học phần thất bại.</p>}

        {!isLoading && !isError && (
          <>
            <DataTable
              columns={[
                { key: "class_section_id", header: "ID" },
                { key: "section_code", header: "Mã lớp học phần" },
                { key: "academic_year", header: "Năm học" },
                { key: "semester", header: "Học kỳ" },
                {
                  key: "courses",
                  header: "Học phần",
                  render: (s: ClassSection) =>
                    s.courses
                      ? `${s.courses.course_code} - ${s.courses.course_name}`
                      : "N/A",
                },
                {
                  key: "lecturers",
                  header: "Giảng viên",
                  render: (s: ClassSection) =>
                    s.lecturers
                      ? `${s.lecturers.last_name} ${s.lecturers.first_name}`
                      : "Chưa phân công",
                },
                { key: "capacity", header: "Sức chứa" },
                {
                  key: "actions",
                  header: "Thao tác",
                  className: "text-center",
                  render: (s: ClassSection) =>
                    !isLecturerView ? (
                      <div className="flex justify-center space-x-2 gap-2">
                        <button
                          className="text-blue-400 hover:text-blue-800 cursor-pointer transition-colors"
                          onClick={() => handleView(s.class_section_id)}
                        >
                          <Eye className="size-4" />
                        </button>
                        <button
                          className="text-gray-500 hover:text-yellow-600 cursor-pointer transition-colors"
                          onClick={() => handleEdit(s)}
                        >
                          <Pencil className="size-4" />
                        </button>
                        <ConfirmDialog
                          onConfirm={() =>
                            deleteMutation.mutate(s.class_section_id)
                          }
                          title="Bạn đã chắc chắn?"
                          description="Lớp học phần này sẽ bị xóa vĩnh viễn và không thể hoàn tác."
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
                          onClick={() => handleView(s.class_section_id)}
                        >
                          <Eye className="size-4" />
                        </button>
                      </div>
                    ),
                },
              ]}
              data={class_section}
              emptyMessage="Không có lớp học phần nào"
            />

            <div className="mt-4">
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </div>
          </>
        )}
      </main>

      {/* ========== ADD MODAL ========== */}
      {!isLecturerView && (
        <Dialog
          open={addOpen}
          onOpenChange={(open) => {
            if (!open) formAdd.reset();
            setAddOpen(open);
          }}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Thêm lớp học phần</DialogTitle>
            </DialogHeader>

            <form
              onSubmit={formAdd.handleSubmit(onSubmitAdd)}
              className="space-y-4"
            >
              <div>
                <Label className="mb-2">Mã lớp học phần</Label>
                <Input {...formAdd.register("section_code")} />
              </div>

              <div>
                <Label className="mb-2">Năm học</Label>
                <Input
                  {...formAdd.register("academic_year")}
                  placeholder="2023-2024"
                />
              </div>

              <div>
                <Label className="mb-2">Học kỳ</Label>
                <Input
                  {...formAdd.register("semester")}
                  placeholder="Hè / Kỳ 1 / Kỳ 2"
                />
              </div>

              <div>
                <Label className="mb-2">Học phần</Label>
                <Select
                  onValueChange={(value) =>
                    formAdd.setValue("course_id", Number(value))
                  }
                >
                  <SelectTrigger className="border rounded px-2 py-1 w-full text-gray-800 [&:invalid]:text-gray-600">
                    <SelectValue placeholder="Chọn học phần" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.course_id} value={String(c.course_id)}>
                        {c.course_code} - {c.course_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-2">Giảng viên</Label>
                <Select
                  onValueChange={(value) =>
                    formAdd.setValue("lecturer_id", Number(value))
                  }
                >
                  <SelectTrigger className="border rounded px-2 py-1 w-full text-gray-800 [&:invalid]:text-gray-600">
                    <SelectValue placeholder="Chọn giảng viên" />
                  </SelectTrigger>
                  <SelectContent>
                    {lecturers.map((l) => (
                      <SelectItem
                        key={l.lecturer_id}
                        value={String(l.lecturer_id)}
                      >
                        {l.last_name} {l.first_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-2">Sức chứa</Label>
                <Input
                  type="number"
                  {...formAdd.register("capacity", { valueAsNumber: true })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2">Ngày bắt đầu</Label>
                  <Input type="date" {...formAdd.register("start_date")} />
                </div>

                <div>
                  <Label className="mb-2">Ngày kết thúc</Label>
                  <Input type="date" {...formAdd.register("end_date")} />
                </div>
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
      )}

      {/* ========== EDIT MODAL ========== */}
      {!isLecturerView && (
        <Dialog
          open={!!editingSection}
          onOpenChange={(open) => {
            if (!open) setEditingSection(null);
          }}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa lớp học phần</DialogTitle>
            </DialogHeader>

            <form
              onSubmit={formEdit.handleSubmit(handleUpdate)}
              className="space-y-4"
            >
              <div>
                <Label className="mb-2">Mã lớp học phần</Label>
                <Input {...formEdit.register("section_code")} />
              </div>

              <div>
                <Label className="mb-2">Năm học</Label>
                <Input {...formEdit.register("academic_year")} />
              </div>

              <div>
                <Label className="mb-2">Học kỳ</Label>
                <Input {...formEdit.register("semester")} />
              </div>

              <div>
                <Label className="mb-2">Học phần</Label>
                <Select
                  defaultValue={
                    editingSection?.course_id ? String(editingSection.course_id) : undefined
                  }
                  onValueChange={(value) =>
                    formEdit.setValue("course_id", Number(value))
                  }
                >
                  <SelectTrigger className="border rounded px-2 py-1 w-full text-gray-800 [&:invalid]:text-gray-600">
                    <SelectValue placeholder="Chọn học phần" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.course_id} value={String(c.course_id)}>
                        {c.course_code} - {c.course_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-2">Giảng viên</Label>
                <Select
                  defaultValue={
                    editingSection?.lecturer_id ? String(editingSection.lecturer_id) : undefined
                  }
                  onValueChange={(value) =>
                    formEdit.setValue("lecturer_id", Number(value))
                  }
                >
                  <SelectTrigger className="border rounded px-2 py-1 w-full text-gray-800 [&:invalid]:text-gray-600">
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

              <div>
                <Label className="mb-2">Sức chứa</Label>
                <Input
                  type="number"
                  {...formEdit.register("capacity", { valueAsNumber: true })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2">Ngày bắt đầu</Label>
                  <Input type="date" {...formEdit.register("start_date")} />
                </div>

                <div>
                  <Label className="mb-2">Ngày kết thúc</Label>
                  <Input type="date" {...formEdit.register("end_date")} />
                </div>
              </div>

              <DialogFooter className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setEditingSection(null)}
                >
                  Đóng
                </Button>
                <Button type="submit">Cập nhật</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Detail Modal */}
      <DetailDialog
        open={!!selectedSection}
        title="Chi tiết lớp học phần"
        onClose={() => setSelectedSection(null)}
      >
        {selectedSection && <ClassSectionDetail section={selectedSection} />}
      </DetailDialog>
    </div>
  );
}
