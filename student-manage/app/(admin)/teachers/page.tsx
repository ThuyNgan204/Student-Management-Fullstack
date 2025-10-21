"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "sonner";
import { Eye, Pencil, Trash2 } from "lucide-react";

import DataTable from "@/components/shared/DataTable";
import Pagination from "@/components/shared/Pagination";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import FormModal from "@/components/shared/FormModal";
import DetailDialog from "@/components/shared/DetailModal";
import { useDebounce } from "@/hooks/useDebounce";
import { useCRUD } from "@/hooks/useCRUD";
import { Department, Lecturer, useLecturerStore } from "@/store/useLecturerStore";
import LecturerDetail from "@/components/lecturers/LecturerDetailModal";
import { TeacherFormInputs, teacherSchema } from "@/lib/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import ControlPanelLecturer from "@/components/lecturers/Lecturer-ControlPanel";
import LecturerForm from "@/components/lecturers/Lecturers";

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
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, genderFilters, departmentFilters, positionFilters, sortBy, sortOrder, setPage]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await axios.get("/api/departments", { params: { page: 1, page_size: 100 } });
        if (isMounted) setDepartments(res.data.items);
      } catch (error) {
        console.error("Failed to load departments:", error);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // Form Add
  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAdd,
    setValue: setValueAdd, // ✅ thêm
    watch: watchAdd,
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
    setValue: setValueEdit, // ✅ thêm
    watch: watchEdit,
    formState: { errors: errorsEdit },
  } = useForm<TeacherFormInputs>({
    resolver: zodResolver(teacherSchema),
  });

  // CRUD hooks
  const {
    data,
    isLoading,
    isError,
    addMutation,
    updateMutation,
    deleteMutation,
    refetch,
  } = useCRUD<Lecturer, TeacherFormInputs>({
    resource: "lecturers",
    idField: "lecturer_id",
    page,
    pageSize,
    search: debouncedSearch,
    sortBy: sortBy || "lecturer_id",
    sortOrder,
    filters: {
      gender: genderFilters,
      department_code: departmentFilters || [],
      position: positionFilters || [],
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
    } catch {
      toast.error("Không tải được chi tiết giảng viên");
    }
  };

  // Bulk actions
  const handleSelectAll = (checked: boolean, data: Lecturer[]) => {
    if (checked) setSelectedIds(data.map((l) => l.lecturer_id));
    else setSelectedIds([]);
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return toast.warning("Chưa chọn giảng viên nào!");
    try {
      await Promise.all(selectedIds.map((id) => deleteMutation.mutateAsync(id)));
      toast.success("Xóa thành công các giảng viên đã chọn!");
      setSelectedIds([]);
    } catch {
      toast.error("Xóa thất bại!");
    }
  };

  const { items: lecturers = [], total = 0 } = data ?? {};
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <ControlPanelLecturer
        total={total}
        addLabel="Thêm Giảng viên"
        onAdd={() => setAddOpen(true)}
        selectedCount={selectedIds.length}
        onBulkDelete={handleBulkDelete}
        onReload={refetch}
      />

      <main className="flex-1 overflow-x-auto px-6 py-4">
        {isLoading && <p>Đang tải...</p>}
        {isError && <p>Tải danh sách Giảng viên thất bại.</p>}

        {!isLoading && !isError && (
          <>
            <DataTable
              columns={[
                {
                  key: "select",
                  header: (
                    <input
                      type="checkbox"
                      checked={selectedIds.length === lecturers.length && lecturers.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked, lecturers)}
                    />
                  ),
                  render: (l: Lecturer) => (
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(l.lecturer_id)}
                      onChange={(e) => handleSelectOne(l.lecturer_id, e.target.checked)}
                    />
                  ),
                  className: "w-8 text-center",
                },
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
                { key: "phone", header: "Số điện thoại" },
                { key: "email", header: "Email" },
                { key: "departments", header: "Khoa", render: (l: Lecturer) => l.departments?.department_name ?? "N/A" },
                { key: "position", header: "Chức vụ" },
                {
                  key: "actions",
                  header: "Thao tác",
                  className: "text-center",
                  render: (l: Lecturer) => (
                    <div className="flex justify-center space-x-2">
                      <button onClick={() => handleView(l.lecturer_id)} className="text-blue-400 hover:text-blue-800">
                        <Eye className="size-4" />
                      </button>
                      <button onClick={() => handleEdit(l)} className="text-gray-500 hover:text-yellow-600">
                        <Pencil className="size-4" />
                      </button>
                      <ConfirmDialog
                        onConfirm={() => deleteMutation.mutate(l.lecturer_id)}
                        title="Bạn đã chắc chắn?"
                        description="Giảng viên này sẽ bị xóa vĩnh viễn và không thể hoàn tác."
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
              data={isError || isLoading ? [] : lecturers || []}
              emptyMessage={isError ? "Lỗi tải danh sách Giảng viên" : "Không có Giảng viên nào"}
            />
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </main>

      {/* Add Lecturer Modal */}
      <FormModal
        open={addOpen}
        onOpenChange={(open) => {
          if (!open) {
            resetAdd();
            setAddOpen(false);
          } else setAddOpen(true);
        }}
        title="Thêm Giảng viên"
        onSubmit={handleSubmitAdd(onSubmitAdd)}
        onCancel={() => {
          resetAdd();
          setAddOpen(false);
        }}
        submitText="Lưu"
      >
        <LecturerForm
          register={registerAdd}
          errors={errorsAdd}
          departments={departments}
          setValue={setValueAdd} // ✅ thêm
          watch={watchAdd}
        />
      </FormModal>

      {/* Edit Lecturer Modal */}
      <FormModal
        open={!!editingLecturer}
        onOpenChange={(open) => {
          if (!open) setEditingLecturer(null);
        }}
        title="Chỉnh sửa thông tin Giảng viên"
        onSubmit={handleSubmitEdit(handleUpdate)}
        onCancel={() => setEditingLecturer(null)}
        submitText="Cập nhật"
      >
        {editingLecturer && (
          <LecturerForm
            register={registerEdit}
            errors={errorsEdit}
            departments={departments}
            setValue={setValueEdit} // ✅ thêm
            watch={watchEdit}
          />
        )}
      </FormModal>

      {/* Detail */}
      <DetailDialog open={!!selectedLecturer} title="Thông tin chi tiết Giảng viên" onClose={() => setSelectedLecturer(null)}>
        {selectedLecturer && <LecturerDetail lecturer={selectedLecturer} />}
      </DetailDialog>
    </div>
  );
}
