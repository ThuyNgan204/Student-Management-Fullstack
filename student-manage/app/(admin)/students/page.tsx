"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useStudentStore, Student } from "@/store/useStudentStore";
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

//  Hooks and Schemas
import { formatDate } from "@/utils/date";
import { useDebounce } from "@/hooks/useDebounce";
import { useCRUD } from "@/hooks/useCRUD";
import { StudentFormInputs, studentSchema } from "@/lib/zodSchemas";
import { Eye, Pencil } from "lucide-react";

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
    sortBy,
    sortOrder,
    setPage,
    setSearch,
    setEditingStudent,
    setSelectedStudent,
    setAddOpen,
  } = useStudentStore();

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, genderFilters, classFilters, sortBy, sortOrder, setPage]);

  // Form Add
  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAdd,
    formState: { errors: errorsAdd },
  } = useForm<StudentFormInputs>({
    resolver: zodResolver(studentSchema),
    defaultValues: { last_name: "", first_name: "", student_code: "", gender: "", dob: "" },
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
    page,
    pageSize,
    search: debouncedSearch,
    genderFilters,
    classFilters,
    sortBy: "student_id",
    sortOrder,
  });

  // Handlers
  const onSubmitAdd = (data: StudentFormInputs) => {
    addMutation.mutate(data);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    resetEdit({
      last_name: student.last_name,
      first_name: student.first_name,
      student_code: student.student_code,
      gender: student.gender,
      dob: student.dob,
    });
  };

  const handleUpdate = (data: StudentFormInputs) => {
    if (editingStudent) {
      updateMutation.mutate({ ...editingStudent, ...data });
    }
  };

  const handleView = async (student_id: number) => {
    try {
      const res = await axios.get(`/api/students/${student_id}`);
      setSelectedStudent(res.data);
    } catch (err) {
      alert("Failed to load student detail");
    }
  };

  const totalPages = data ? Math.ceil(data.total / pageSize) : 1;

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">

      {/* Control Panel */}
        <ControlPanel
          total={data?.total ?? 0}
          addLabel="Add Student"
          addTotal="Total Students"
          onAdd={() => setAddOpen(true)}
        />


      {/* Table */}
      <main className="flex-1 overflow-x-auto px-6 py-4">
        {isLoading && <p>Loading...</p>}
        {isError && <p>Error loading students.</p>}

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
                { key: "cohort", header: "Khóa"},
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
                      <Button variant="secondary" onClick={() => handleView(s.student_id)}><Eye className="h-4 w-4"/></Button>
                      <Button variant="default" onClick={() => handleEdit(s)}><Pencil className="h-4 w-4"/></Button>

                      <ConfirmDialog
                        onConfirm={() => deleteMutation.mutate(s.student_id)}
                        title="Are you absolutely sure?"
                        description="This action cannot be undone. This will permanently delete the student from the system."
                      />

                  </div>
                  ),
                },
              ]}
                data={isError || isLoading ? [] : data?.items || []}
                emptyMessage={isError ? "Error loading students" : "No students found"}
            />

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </main>

      {/* Add Student Modal */}
      <FormModal
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Add Student"
        onSubmit={handleSubmitAdd(onSubmitAdd)}
        onCancel={() => setAddOpen(false)}
        submitText="Save"
      >
        <div>
          <Label className="mb-2">Last Name</Label>
          <Input {...registerAdd("last_name")} />
          {errorsAdd.last_name && (
            <p className="text-xs text-red-500">{errorsAdd.last_name.message}</p>
          )}
        </div>

        <div>
          <Label className="mb-2">First Name</Label>
          <Input {...registerAdd("first_name")} />
          {errorsAdd.first_name && (
            <p className="text-xs text-red-500">{errorsAdd.first_name.message}</p>
          )}
        </div>

        <div>
          <Label className="mb-2">Student Code</Label>
          <Input {...registerAdd("student_code")} />
          {errorsAdd.student_code && (
            <p className="text-xs text-red-500">{errorsAdd.student_code.message}</p>
          )}
        </div>

        <div>
          <Label className="mb-2">Gender</Label>
          <select {...registerAdd("gender")} className="border rounded px-2 py-1 w-full">
            <option value="">Select gender</option>
            <option value="Nam">Male</option>
            <option value="Nữ">Female</option>
          </select>
          {errorsAdd.gender && (
            <p className="text-xs text-red-500">{errorsAdd.gender.message}</p>
          )}
        </div>

        <div>
          <Label className="mb-2">Date of Birth</Label>
          <Input type="date" {...registerAdd("dob")} />
          {errorsAdd.dob && (
            <p className="text-xs text-red-500">{errorsAdd.dob.message}</p>
          )}
        </div>
      </FormModal>

      {/* Edit Student Modal */}
      <FormModal
        open={!!editingStudent}
        onOpenChange={(open) => {
          if (!open) setEditingStudent(null);
        }}
        title="Edit Student"
        onSubmit={handleSubmitEdit(handleUpdate)}
        onCancel={() => setEditingStudent(null)}
        submitText="Update"
      >
        {editingStudent && (
          <>
            <div>
              <Label className="mb-2">Last Name</Label>
              <Input {...registerEdit("last_name")} />
              {errorsEdit.last_name && <p className="text-xs text-red-500">{errorsEdit.last_name.message}</p>}
            </div>

            <div>
              <Label className="mb-2">First Name</Label>
              <Input {...registerEdit("first_name")} />
              {errorsEdit.first_name && <p className="text-xs text-red-500">{errorsEdit.first_name.message}</p>}
            </div>

            <div>
              <Label className="mb-2">Student Code</Label>
              <Input {...registerEdit("student_code")} />
              {errorsEdit.student_code && <p className="text-xs text-red-500">{errorsEdit.student_code.message}</p>}
            </div>

            <div>
              <Label className="mb-2">Gender</Label>
              <select {...registerEdit("gender")} className="border rounded px-2 py-1 w-full">
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {errorsEdit.gender && <p className="text-xs text-red-500">{errorsEdit.gender.message}</p>}
            </div>

            <div>
              <Label className="mb-2">Date of Birth</Label>
              <Input type="date" {...registerEdit("dob")} />
              {errorsEdit.dob && <p className="text-xs text-red-500">{errorsEdit.dob.message}</p>}
            </div>
          </>
        )}
      </FormModal>

      {/* View Modal */}
      <DetailDialog
        open={!!selectedStudent}
        title="Student Detail"
        onClose={() => setSelectedStudent(null)}
      >
        {selectedStudent && (
          <ul className="space-y-2">
            <li>
              <strong>ID:</strong> {selectedStudent.student_id}
            </li>
            <li>
              <strong>Họ Tên:</strong> {selectedStudent.last_name} {selectedStudent.first_name}
            </li>
            <li>
              <strong>Giới tính:</strong> {selectedStudent.gender}
            </li>
            <li>
              <strong>MSSV:</strong> {selectedStudent.student_code}
            </li>
            <li>
              <strong>Ngày sinh:</strong> {formatDate(selectedStudent.dob)}
            </li>
            <li>
              <strong>Địa chỉ:</strong> {selectedStudent.address}
            </li>
            <li>
              <strong>Số điện thoại:</strong> {selectedStudent.phone}
            </li>
            <li>
              <strong>Email:</strong> {selectedStudent.email}
            </li>
            <li>
              <strong>Lớp:</strong> {selectedStudent.academic_class?.class_name}
            </li>
            <li>
              <strong>Cố vấn học tập:</strong> {selectedStudent.academic_class?.lecturers?.last_name}{" "}
                {selectedStudent?.academic_class?.lecturers?.first_name}
            </li>
            <li>
              <strong>Chuyên ngành:</strong> {selectedStudent.majors?.major_name}
            </li>
            <li>
              <strong>Khoa:</strong> {selectedStudent.majors?.departments?.department_name}
            </li>
            <li>
              <strong>Khóa:</strong> {selectedStudent.cohort}
            </li>
            <li>
              <strong>Tình trạng:</strong> {selectedStudent.status}
            </li>
          </ul>
        )}
      </DetailDialog>
    </div>
  );
}

