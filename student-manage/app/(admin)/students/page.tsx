// page.tsx
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useStudentStore, Student, Major, AcademicClass } from "@/store/useStudentStore";
import Link from "next/link";
import axios from "axios";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ControlPanel from "@/components/shared/ControlPanel";
import DataTable from "@/components/shared/DataTable";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import Pagination from "@/components/shared/Pagination";
import DetailDialog from "@/components/shared/DetailModal";
import FormModal from "@/components/shared/FormModal";

// Hooks and Schemas
import { formatDate } from "@/utils/date";
import { useDebounce } from "@/hooks/useDebounce";
import { useCRUD } from "@/hooks/useCRUD";
import { StudentFormInputs, studentSchema } from "@/lib/zodSchemas";
import { Eye, Pencil } from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const {
    page,
    pageSize,
    search,
    editingStudent,
    selectedStudent,
    addOpen,
    genderFilters,
    classFilters,
    majorFilters,
    sortBy,
    sortOrder,
    setPage,
    setSearch,
    setEditingStudent,
    setSelectedStudent,
    setAddOpen,
  } = useStudentStore();

  const [majors, setMajors] = useState<Major[]>([]);
  const [classes, setClasses] = useState<AcademicClass[]>([]);

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    // Luôn reset trang về 1 khi thay đổi filter hoặc tìm kiếm
    setPage(1);
  }, [debouncedSearch, genderFilters, classFilters, majorFilters]);

  // ✅ Khi đổi field sort → gọi API ngay (dựa trên order hiện có)
  useEffect(() => {
    if (sortBy) {
      setPage(1);
    }
  }, [sortBy]);

  // ✅ Khi đổi asc/desc → chỉ gọi nếu đã có field
  useEffect(() => {
    if (sortBy) {
      setPage(1);
    }
  }, [sortOrder]);

  // Fetch majors & classes for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      
      try {
        const [majorsRes, classesRes] = await Promise.all([
          axios.get("/api/majors"),
          axios.get("/api/academic_class"),
        ]);
        console.log("Majors API:", majorsRes.data);
        console.log("Classes API:", classesRes.data);
        
        setMajors(Array.isArray(majorsRes.data) ? majorsRes.data : majorsRes.data.items || []);
        setClasses(Array.isArray(classesRes.data) ? classesRes.data : classesRes.data.items || []);
      } catch (err) {
        console.error("Failed to load majors/classes", err);
      }
    };
    fetchData();
  }, []);

  // Form Add
  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAdd,
    formState: { errors: errorsAdd },
  } = useForm<StudentFormInputs>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      last_name: "",
      first_name: "",
      student_code: "",
      gender: "",
      dob: "",
      address: "",
      phone: "",
      email: "",
      major_id: undefined,
      academic_class_id: undefined,
      cohort: "",
      status: "Đang học",
      avatar: "",
    },
  });

  // Form Edit
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit },
  } = useForm<StudentFormInputs>({
    resolver: zodResolver(studentSchema),
  });

  // Queries
 const {
  data,
  isLoading,
  isError,
  addMutation,
  updateMutation,
  deleteMutation,
} = useCRUD<Student, StudentFormInputs>({
  resource: "students",
  idField: "student_id",             // ✅ BẮT BUỘC THÊM
  page,
  pageSize,
  search: debouncedSearch,
  sortBy: sortBy || "student_id",
  sortOrder,
  filters: {
    gender: genderFilters,
    class_code: classFilters,
    major_code: majorFilters,
  },
});


  // Handlers
  const onSubmitAdd = (data: StudentFormInputs) => {
    addMutation.mutate(data, {
       onSuccess: () => {
      toast.success("Thêm sinh viên thành công");
      resetAdd();
      setAddOpen(false);
    },
    onError: () => {
      toast.error("Thêm sinh viên thất bại");
    },
    });
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    resetEdit({
      last_name: student.last_name,
      first_name: student.first_name,
      student_code: student.student_code,
      gender: student.gender,
      dob: student.dob? new Date(student.dob).toISOString().split("T")[0] : "",
      address: student.address ?? "",
      phone: student.phone ?? "",
      email: student.email ?? "",
      major_id: student.major_id ?? undefined,
      academic_class_id: student.academic_class_id ?? undefined,
      cohort: student.cohort ?? "",
      status: student.status as "Đang học" | "Bảo lưu" | "Tốt nghiệp",
    });
  };

  const handleUpdate = (data: StudentFormInputs) => {
    if (editingStudent) {
      updateMutation.mutate(
      { ...editingStudent, ...data },
      {
        onSuccess: () => {
          toast.success("Cập nhật thành công");
          resetEdit();
          setEditingStudent(null);
        },
        onError: () => {
          toast.error("Cập nhật thất bại");
        },
      }
    );
    }
  };

  const handleView = async (student_id: number) => {
    try {
      const res = await axios.get(`/api/students/${student_id}`);
      setSelectedStudent(res.data);
    } catch (err) {
      alert("Tải thông tin chi tiết Sinh viên thất bại");
    }
  };

  const totalPages = data ? Math.ceil(data.total / pageSize) : 1;

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      {/* Control Panel */}
      <ControlPanel
        total={data?.total ?? 0}
        addLabel="Thêm Sinh viên"
        addTotal="Tổng Sinh viên"
        onAdd={() => setAddOpen(true)}
      />

      {/* Table */}
      <main className="flex-1 overflow-x-auto px-6 py-4">
        {isLoading && <p>Đang tải...</p>}
        {isError && <p>Tải danh sách Sinh viên thất bại.</p>}

        {!isLoading && !isError && (
          <>
            <DataTable
              columns={[
                { key: "student_id", header: "ID" },
                {
                  key: "last_name",
                  header: "Họ",
                  render: (student) => (
                    <Link
                      href={`/students/${student.student_id}`}
                      className="text-primary hover:underline hover:text-primary/80"
                    >
                      {student.last_name}
                    </Link>
                  ),
                },
                {
                  key: "first_name",
                  header: "Tên",
                  render: (student) => (
                    <Link
                      href={`/students/${student.student_id}`}
                      className="text-primary hover:underline hover:text-primary/80"
                    >
                      {student.first_name}
                    </Link>
                  ),
                },
                { key: "gender", header: "Giới tính" },
                { key: "dob", header: "Ngày sinh", render: (s) => formatDate(s.dob) },
                { key: "student_code", header: "MSSV" },
                { key: "cohort", header: "Khóa" },
                {
                  key: "majors",
                  header: "Ngành",
                  render: (student) => student.majors?.major_code ?? "N/A",
                },
                {
                  key: "academic_class",
                  header: "Lớp sinh hoạt",
                  render: (student) => student.academic_class?.class_code ?? "N/A",
                },
                {
                  key: "actions",
                  header: "Actions",
                  className: "text-center",
                  render: (s) => (
                    <div className="space-x-2">
                      <Button variant="secondary" onClick={() => handleView(s.student_id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="default" onClick={() => handleEdit(s)}>
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <ConfirmDialog
                        onConfirm={() => deleteMutation.mutate(s.student_id)}
                        title="Bạn đã chắc chắn?"
                        description="Sinh viên này sẽ bị xóa vĩnh viễn và không thể hoàn tác."
                      />
                    </div>
                  ),
                },
              ]}
              data={isError || isLoading ? [] : data?.items || []}
              emptyMessage={isError ? "Lỗi tải Sinh viên" : "Không có Sinh viên nào"}
            />

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </main>

      {/* Add Student Modal */}
      <FormModal
        open={addOpen}
        onOpenChange={(open) => {
          // Nếu đóng modal (open = false) → reset form
          if (!open) {
            resetAdd();
            setAddOpen(false);
          } else {
            setAddOpen(true);
          }
        }}
        title="Thêm Sinh viên"
        onSubmit={handleSubmitAdd(onSubmitAdd)}
        onCancel={() => {
          resetAdd();
          setAddOpen(false);
        }}
        submitText="Lưu"
      >
        <StudentForm register={registerAdd} errors={errorsAdd} majors={majors} classes={classes} />
      </FormModal>

      {/* Edit Student Modal */}
      <FormModal
        open={!!editingStudent}
        onOpenChange={(open) => {
          if (!open) setEditingStudent(null);
        }}
        title="Chỉnh sửa thông tin Sinh viên"
        onSubmit={handleSubmitEdit(handleUpdate)}
        onCancel={() => setEditingStudent(null)}
        submitText="Cập nhật"
      >
        {editingStudent && (
          <StudentForm register={registerEdit} errors={errorsEdit} majors={majors} classes={classes} />
        )}
      </FormModal>

      {/* View Modal */}
      <DetailDialog open={!!selectedStudent} title="Student Detail" onClose={() => setSelectedStudent(null)}>
      {selectedStudent && (
        <div className="grid grid-cols-12 gap-y-3 gap-x-6">
          <div className="col-span-4 text-gray-500 font-medium">ID:</div>
          <div className="col-span-8">{selectedStudent.student_id}</div>

          <div className="col-span-4 text-gray-500 font-medium">Họ Tên:</div>
          <div className="col-span-8">
            {selectedStudent.last_name} {selectedStudent.first_name}
          </div>

          <div className="col-span-4 text-gray-500 font-medium">Giới tính:</div>
          <div className="col-span-8">{selectedStudent.gender}</div>

          <div className="col-span-4 text-gray-500 font-medium">MSSV:</div>
          <div className="col-span-8">{selectedStudent.student_code}</div>

          <div className="col-span-4 text-gray-500 font-medium">Ngày sinh:</div>
          <div className="col-span-8">{formatDate(selectedStudent.dob)}</div>

          <div className="col-span-4 text-gray-500 font-medium">Địa chỉ:</div>
          <div className="col-span-8">{selectedStudent.address}</div>

          <div className="col-span-4 text-gray-500 font-medium">Số điện thoại:</div>
          <div className="col-span-8">{selectedStudent.phone}</div>

          <div className="col-span-4 text-gray-500 font-medium">Email:</div>
          <div className="col-span-8">{selectedStudent.email}</div>

          <div className="col-span-4 text-gray-500 font-medium">Lớp:</div>
          <div className="col-span-8">{selectedStudent.academic_class?.class_name}</div>

          <div className="col-span-4 text-gray-500 font-medium">Cố vấn học tập:</div>
          <div className="col-span-8">
            {selectedStudent.academic_class?.lecturers?.last_name}{" "}
            {selectedStudent.academic_class?.lecturers?.first_name}
          </div>

          <div className="col-span-4 text-gray-500 font-medium">Chuyên ngành:</div>
          <div className="col-span-8">{selectedStudent.majors?.major_name}</div>

          <div className="col-span-4 text-gray-500 font-medium">Khoa:</div>
          <div className="col-span-8">{selectedStudent.majors?.departments?.department_name}</div>

          <div className="col-span-4 text-gray-500 font-medium">Khóa:</div>
          <div className="col-span-8">{selectedStudent.cohort}</div>

          <div className="col-span-4 text-gray-500 font-medium">Tình trạng:</div>
          <div className="col-span-8">{selectedStudent.status}</div>
        </div>
      )}
    </DetailDialog>
    </div>
  );
}

// Reusable Form Component
function StudentForm({
  register,
  errors,
  majors,
  classes,
}: {
  register: ReturnType<typeof useForm<StudentFormInputs>>["register"];
  errors: any;
  majors: Major[];
  classes: AcademicClass[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label className="mb-2">Họ</Label>
        <Input {...register("last_name")} />
        {errors.last_name && <p className="text-xs text-red-500">{errors.last_name.message}</p>}
      </div>

      <div>
        <Label className="mb-2">Tên</Label>
        <Input {...register("first_name")} />
        {errors.first_name && <p className="text-xs text-red-500">{errors.first_name.message}</p>}
      </div>

      <div>
        <Label className="mb-2">MSSV</Label>
        <Input {...register("student_code")} />
        {errors.student_code && <p className="text-xs text-red-500">{errors.student_code.message}</p>}
      </div>

      <div>
        <Label className="mb-2">Giới Tính</Label>
        <select {...register("gender")} className="border rounded px-2 py-1 w-full">
          <option value="">Chọn giới tính</option>
          <option value="Nam">Nam</option>
          <option value="Nữ">Nữ</option>
          <option value="Nữ">Khác</option>
        </select>
        {errors.gender && <p className="text-xs text-red-500">{errors.gender.message}</p>}
      </div>

      <div>
        <Label className="mb-2">Ngày sinh</Label>
        <Input type="date" {...register("dob")} />
        {errors.dob && <p className="text-xs text-red-500">{errors.dob.message}</p>}
      </div>

      <div>
        <Label className="mb-2">Địa chỉ</Label>
        <Input {...register("address")} />
      </div>

      <div>
        <Label className="mb-2">Số điện thoại</Label>
        <Input {...register("phone")} />
        {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
      </div>

      <div>
        <Label className="mb-2">Email</Label>
        <Input type="email" {...register("email")} />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      <div>
        <Label className="mb-2">Chuyên ngành</Label>
        <select {...register("major_id")} className="border rounded px-2 py-1 w-full">
          <option value="">Chọn chuyên ngành</option>
          {(majors || []).map((m) => (
            <option key={m.major_id} value={m.major_id}>
              {m.major_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label className="mb-2">Lớp sinh hoạt</Label>
        <select {...register("academic_class_id")} className="border rounded px-2 py-1 w-full">
          <option value="">Chọn lớp sinh hoạt</option>
          {(classes || []).map((c) => (
            <option key={c.academic_class_id} value={c.academic_class_id}>
              {c.class_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label className="mb-2">Khóa</Label>
        <Input {...register("cohort")} />
      </div>

      <div>
        <Label className="mb-2">Tình trạng</Label>
        <select {...register("status")} className="border rounded px-2 py-1 w-full">
          <option value="">Chọn tình trạng</option>
          <option value="Đang học">Đang học</option>
          <option value="Bảo lưu">Bảo lưu</option>
          <option value="Tốt nghiệp">Tốt nghiệp</option>
        </select>
      </div>

      <div className="col-span-2">
              <Label className="mb-2">Ảnh đại diện (URL)</Label>
              <Input {...register("avatar")} />
            </div>
    </div>
  );
}
