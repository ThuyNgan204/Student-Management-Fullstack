// app/lecturers/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "sonner";
import { Eye, Pencil } from "lucide-react";

import ControlPanel from "@/components/shared/ControlPanel";
import DataTable from "@/components/shared/DataTable";
import Pagination from "@/components/shared/Pagination";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import FormModal from "@/components/shared/FormModal";
import DetailDialog from "@/components/shared/DetailModal";
import { useDebounce } from "@/hooks/useDebounce";
import { useCRUD } from "@/hooks/useCRUD";
import { Department, Lecturer, useLecturerStore } from "@/store/useLecturerStore";
import LecturerForm from "@/components/lecturers/Lecturers";
import LecturerDetail from "@/components/lecturers/LecturerDetailModal";
import { TeacherFormInputs, teacherSchema } from "@/lib/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";

export default function LecturersPage() {
  const {
    page,
    pageSize,
    search,
    editingLecturer,
    selectedLecturer,
    addOpen,
    genderFilters,
    departmentFilters,
    positionFilters,
    sortBy,
    sortOrder,
    setPage,
    setSearch,
    setEditingLecturer,
    setSelectedLecturer,
    setAddOpen,
  } = useLecturerStore();

  const [departments, setDepartments] = useState<Department[]>([]);

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, genderFilters, departmentFilters, positionFilters, sortBy, sortOrder, setPage]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get("/api/departments");
        setDepartments(res.data);
      } catch (err) {
        console.error("Failed to load departments", err);
      }
    };
    fetch();
  }, []);

  // Form Add
  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAdd,
    formState: { errors: errorsAdd },
  } = useForm<TeacherFormInputs>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      lecturer_code: "",
      first_name: "",
      last_name: "",
      gender: "",
      dob: "",
      phone: "",
      email: "",
      address: "",
      department_id: undefined,
      position: "",
      avatar: "",
    },
  });

  // Form Edit
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit },
  } = useForm<TeacherFormInputs>({
    resolver: zodResolver(teacherSchema),});

  // CRUD hooks (reuses your existing useCRUD)
const {
  data,
  isLoading,
  isError,
  addMutation,
  updateMutation,
  deleteMutation,
} = useCRUD<Lecturer, TeacherFormInputs>({
  resource: "lecturers",
  idField: "lecturer_id",         // ✅ BẮT BUỘC THÊM
  page,
  pageSize,
  search: debouncedSearch,
  sortBy: "lecturer_id",
  sortOrder,
  filters: {
    gender: genderFilters,
    // nếu lọc theo department_id
    department_id: departmentFilters || [],
  },
});


  const onSubmitAdd = (dataForm: TeacherFormInputs) => {
    addMutation.mutate(dataForm, {
      onSuccess: () => {
        toast.success("Thêm giảng viên thành công");
        resetAdd();
        setAddOpen(false);
      },
      onError: () => {
        toast.error("Thêm giảng viên thất bại");
      },
    });
  };

  const handleEdit = (lect: Lecturer) => {
    setEditingLecturer(lect);
    resetEdit({
      lecturer_code: lect.lecturer_code,
      first_name: lect.first_name,
      last_name: lect.last_name,
      gender: lect.gender ?? "",
      dob: lect.dob ? new Date(lect.dob).toISOString().split("T")[0] : "",
      phone: lect.phone ?? "",
      email: lect.email ?? "",
      address: lect.address ?? "",
      department_id: lect.department_id ?? undefined,
      position: lect.position ?? "",
      avatar: lect.avatar ?? "",
    });
  };

  const handleUpdate = (dataForm: TeacherFormInputs) => {
    if (editingLecturer) {
      updateMutation.mutate(
        { ...editingLecturer, ...dataForm },
        {
          onSuccess: () => {
            toast.success("Cập nhật giảng viên thành công");
            resetEdit();
            setEditingLecturer(null);
          },
          onError: () => {
            toast.error("Cập nhật giảng viên thất bại");
          },
        }
      );
    }
  };

  const handleView = async (lecturer_id: number) => {
    try {
      const res = await axios.get(`/api/lecturers/${lecturer_id}`);
      setSelectedLecturer(res.data);
    } catch (err) {
      toast.error("Không tải được chi tiết giảng viên");
    }
  };

  const totalPages = data ? Math.ceil(data.total / pageSize) : 1;

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <ControlPanel
        total={data?.total ?? 0}
        addLabel="Add Lecturer"
        addTotal="Total Lecturers"
        onAdd={() => setAddOpen(true)}
      />

      <main className="flex-1 overflow-x-auto px-6 py-4">
        {isLoading && <p>Loading...</p>}
        {isError && <p>Error loading lecturers.</p>}

        {!isLoading && !isError && (
          <>
            <DataTable
              columns={[
                { key: "lecturer_id", header: "ID" },
                {
                  key: "last_name",
                  header: "Họ",
                  render: (l: Lecturer) => (
                    <a href={`/lecturers/${l.lecturer_id}`} className="text-primary hover:underline">
                      {l.last_name}
                    </a>
                  ),
                },
                { key: "first_name", header: "Tên", render: (l: Lecturer) => l.first_name },
                { key: "lecturer_code", header: "Mã GV" },
                { key: "gender", header: "Giới tính" },
                { key: "phone", header: "Phone" },
                { key: "email", header: "Email" },
                { key: "departments", header: "Khoa", render: (l: Lecturer) => l.departments?.department_name ?? "N/A" },
                { key: "position", header: "Chức vụ" },
                {
                  key: "actions",
                  header: "Actions",
                  className: "text-center",
                  render: (l: Lecturer) => (
                    <div className="space-x-2">
                      <button className="btn" onClick={() => handleView(l.lecturer_id)}>
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="btn" onClick={() => handleEdit(l)}>
                        <Pencil className="h-4 w-4" />
                      </button>
                      <ConfirmDialog
                        onConfirm={() => deleteMutation.mutate(l.lecturer_id)}
                        title="Are you absolutely sure?"
                        description="This action cannot be undone. This will permanently delete the lecturer and associated account."
                      />
                    </div>
                  ),
                },
              ]}
              data={isError || isLoading ? [] : data?.items || []}
              emptyMessage={isError ? "Error loading lecturers" : "No lecturers found"}
            />

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </main>

      {/* Add Lecturer Modal */}
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
        title="Add Lecturer"
        onSubmit={handleSubmitAdd(onSubmitAdd)}
        onCancel={() => {
          resetAdd();
          setAddOpen(false);
        }}
        submitText="Save"
      >
        <LecturerForm register={registerAdd} errors={errorsAdd} departments={departments} />
      </FormModal>

      {/* Edit Lecturer Modal */}
      <FormModal
        open={!!editingLecturer}
        onOpenChange={(open) => {
          if (!open) setEditingLecturer(null);
        }}
        title="Edit Lecturer"
        onSubmit={handleSubmitEdit(handleUpdate)}
        onCancel={() => setEditingLecturer(null)}
        submitText="Update"
      >
        {editingLecturer && (
          <LecturerForm register={registerEdit} errors={errorsEdit} departments={departments} />
        )}
      </FormModal>

      {/* Detail */}
      <DetailDialog open={!!selectedLecturer} title="Lecturer Detail" onClose={() => setSelectedLecturer(null)}>
        {selectedLecturer && <LecturerDetail lecturer={selectedLecturer} />}
      </DetailDialog>
    </div>
  );
}
