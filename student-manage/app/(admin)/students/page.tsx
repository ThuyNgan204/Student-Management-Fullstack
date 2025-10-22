"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useStudentStore, Student, Major, AcademicClass } from "@/store/useStudentStore";
import Link from "next/link";
import axios from "axios";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ControlPanel from "@/components/shared/ControlPanel";
import DataTable from "@/components/shared/DataTable";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import Pagination from "@/components/shared/Pagination";
import DetailDialog from "@/components/shared/DetailModal";
import FormModal from "@/components/shared/FormModal";

import { formatDate } from "@/utils/date";
import { useDebounce } from "@/hooks/useDebounce";
import { useCRUD } from "@/hooks/useCRUD";
import { StudentFormInputs, studentSchema } from "@/lib/zodSchemas";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    departmentFilters,
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
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, genderFilters, classFilters, majorFilters, departmentFilters]);

  useEffect(() => {
    if (sortBy) setPage(1);
  }, [sortBy, sortOrder]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [majorsRes, classesRes] = await Promise.all([
          axios.get("/api/majors", { params: { page: 1, page_size: 1000 } }),
          axios.get("/api/academic_class", { params: { page: 1, page_size: 1000 } }),
        ]);

        setMajors(Array.isArray(majorsRes.data) ? majorsRes.data : majorsRes.data.items || []);
        setClasses(Array.isArray(classesRes.data) ? classesRes.data : classesRes.data.items || []);
      } catch (err) {
        console.error("Failed to load majors/classes", err);
      }
    };
    fetchData();
  }, []);

  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAdd,
    formState: { errors: errorsAdd },
    setValue: setValueAdd,
    watch: watchAdd,
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

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit },
    setValue: setValueEdit,
    watch: watchEdit,
  } = useForm<StudentFormInputs>({
    resolver: zodResolver(studentSchema),
  });

  const {
    data,
    isLoading,
    isError,
    addMutation,
    updateMutation,
    deleteMutation,
    refetch,
  } = useCRUD<Student, StudentFormInputs>({
    resource: "students",
    idField: "student_id",
    page,
    pageSize,
    search: debouncedSearch,
    sortBy: sortBy || "student_id",
    sortOrder,
    filters: {
      gender: genderFilters,
      class_code: classFilters,
      major_code: majorFilters,
      department_code: departmentFilters,
    },
  });

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
      dob: student.dob ? new Date(student.dob).toISOString().split("T")[0] : "",
      address: student.address ?? "",
      phone: student.phone ?? "",
      email: student.email ?? "",
      major_id: student.major_id ?? undefined,
      academic_class_id: student.academic_class_id ?? undefined,
      cohort: student.cohort ?? "",
      status: student.status as "Đang học" | "Bảo lưu" | "Tốt nghiệp",
      avatar: student.avatar ?? "",
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

  const handleSelectAll = (checked: boolean, data: Student[]) => {
    setSelectedIds(checked ? data.map((s) => s.student_id) : []);
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return toast.warning("Chưa chọn sinh viên nào!");
    try {
      await Promise.all(selectedIds.map((id) => deleteMutation.mutateAsync(id)));
      toast.success("Xóa thành công các sinh viên đã chọn!");
      setSelectedIds([]);
    } catch {
      toast.error("Xóa thất bại!");
    }
  };

  const { items: students = [], total = 0 } = data ?? {};
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <ControlPanel
        total={total}
        addLabel="Thêm Sinh viên"
        onAdd={() => setAddOpen(true)}
        selectedCount={selectedIds.length}
        onBulkDelete={handleBulkDelete}
        onReload={refetch}
      />

      <main className="flex-1 overflow-x-auto px-6 py-4">
        {isLoading && <p>Đang tải...</p>}
        {isError && <p>Tải danh sách Sinh viên thất bại.</p>}

        {!isLoading && !isError && (
          <>
            <DataTable
              columns={[
                {
                  key: "select",
                  header: (
                    <input
                      type="checkbox"
                      checked={selectedIds.length === students.length && students.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked, students)}
                    />
                  ),
                  render: (s: Student) => (
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(s.student_id)}
                      onChange={(e) => handleSelectOne(s.student_id, e.target.checked)}
                    />
                  ),
                  className: "w-8 text-center",
                },
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
                  key: "departments",
                  header: "Khoa",
                  render: (student) =>
                    student.majors?.departments?.department_name ?? "N/A",
                },
                {
                  key: "majors",
                  header: "Ngành",
                  render: (student) => student.majors?.major_name ?? "N/A",
                },
                {
                  key: "academic_class",
                  header: "Lớp sinh hoạt",
                  render: (student) => student.academic_class?.class_code ?? "N/A",
                },
                {
                  key: "actions",
                  header: "Thao tác",
                  className: "text-center",
                  render: (s: Student) => (
                    <div className="flex justify-center gap-2">
                      <button
                        className="text-blue-400 hover:text-blue-800"
                        onClick={() => handleView(s.student_id)}
                      >
                        <Eye className="size-4" />
                      </button>
                      <button
                        className="text-gray-500 hover:text-yellow-600"
                        onClick={() => handleEdit(s)}
                      >
                        <Pencil className="size-4" />
                      </button>
                      <ConfirmDialog
                        onConfirm={() => deleteMutation.mutate(s.student_id)}
                        title="Bạn đã chắc chắn?"
                        description="Sinh viên này sẽ bị xóa vĩnh viễn và không thể hoàn tác."
                        trigger={
                          <button className="text-red-500 hover:text-red-700">
                            <Trash2 size={16} />
                          </button>
                        }
                      />
                    </div>
                  ),
                },
              ]}
              data={students}
              emptyMessage="Không có Sinh viên nào"
            />

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </main>

      <FormModal
        open={addOpen}
        onOpenChange={(open) => {
          if (!open) {
            resetAdd();
            setAddOpen(false);
          } else setAddOpen(true);
        }}
        title="Thêm Sinh viên"
        onSubmit={handleSubmitAdd(onSubmitAdd)}
        onCancel={() => {
          resetAdd();
          setAddOpen(false);
        }}
        submitText="Lưu"
      >
        <StudentForm
          register={registerAdd}
          errors={errorsAdd}
          majors={majors}
          classes={classes}
          setValue={setValueAdd}
          watch={watchAdd}
        />
      </FormModal>

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
          <StudentForm
            register={registerEdit}
            errors={errorsEdit}
            majors={majors}
            classes={classes}
            setValue={setValueEdit}
            watch={watchEdit}
          />
        )}
      </FormModal>

      <DetailDialog
        open={!!selectedStudent}
        title="Thông tin Sinh viên"
        onClose={() => setSelectedStudent(null)}
      >
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

function StudentForm({
  register,
  errors,
  majors,
  classes,
  setValue,
  watch,
}: {
  register: ReturnType<typeof useForm<StudentFormInputs>>["register"];
  errors: any;
  majors: Major[];
  classes: AcademicClass[];
  setValue: (field: keyof StudentFormInputs, value: any) => void;
  watch: ReturnType<typeof useForm<StudentFormInputs>>["watch"];
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
        <Label className="mb-2">Giới tính</Label>
        <Select 
          onValueChange={(value) => setValue("gender", value)}
          value={watch("gender")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Chọn giới tính" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Nam">Nam</SelectItem>
            <SelectItem value="Nữ">Nữ</SelectItem>
            <SelectItem value="Khác">Khác</SelectItem>
          </SelectContent>
        </Select>
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
        <Select 
          onValueChange={(value) => setValue("major_id", Number(value))}
          value={watch("major_id") ? watch("major_id").toString() : ""}
        >
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
        {errors.major_id && <p className="text-xs text-red-500">{errors.major_id.message}</p>}
      </div>

      <div>
        <Label className="mb-2">Lớp sinh hoạt</Label>
        <Select 
          onValueChange={(value) => setValue("academic_class_id", Number(value))}
            value={watch("academic_class_id") ? watch("academic_class_id").toString() : ""}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Chọn lớp sinh hoạt" />
          </SelectTrigger>
          <SelectContent className="max-h-60 overflow-y-auto">
            {classes.map((c) => (
              <SelectItem key={c.academic_class_id} value={c.academic_class_id.toString()}>
                {c.class_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.academic_class_id && (
          <p className="text-xs text-red-500">{errors.academic_class_id.message}</p>
        )}
      </div>

      <div>
        <Label className="mb-2">Khóa</Label>
        <Input {...register("cohort")} />
      </div>

      <div>
        <Label className="mb-2">Trạng thái</Label>
        <Select 
          onValueChange={(value) => setValue("status", value)}
          value={watch("status")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Trạng thái sinh viên" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Đang học">Đang học</SelectItem>
            <SelectItem value="Bảo lưu">Bảo lưu</SelectItem>
            <SelectItem value="Tốt nghiệp">Tốt nghiệp</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="col-span-2">
              <Label className="mb-2">Ảnh đại diện (URL)</Label>
              <Input {...register("avatar")} />
            </div>
    </div>
  );
}
