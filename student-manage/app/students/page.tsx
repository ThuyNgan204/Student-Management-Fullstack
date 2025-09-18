"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import { useStudentStore, Student } from "@/store/useStudentStore";

import StudentControlPanel from "./components/StudentControlPanel";
import StudentTable from "./components/StudentTable";
import StudentAddDialog from "./components/StudentAddDialog";
import StudentEditDialog from "./components/StudentEditDialog";
import StudentViewDialog from "./components/StudentViewDialog";

// Schema and Types
const studentSchema = z.object({
  last_name: z.string().min(1, { message: "Please enter a last name!" }),
  first_name: z.string().min(1, { message: "Please enter a first name!" }),
  class_name: z.string().min(1, { message: "Please enter a class!" }),
  gender: z.string().min(1, { message: "Please enter a gender!" }),
  dob: z.string().min(1, { message: "Please select date of birth!" }),
});
export type StudentFormInputs = z.infer<typeof studentSchema>;

export type StudentResponse = {
  items: Student[];
  total: number;
};

// Debounce Hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

// Main Component
export default function StudentsPage() {
  const queryClient = useQueryClient();
  const {
    page,
    pageSize,
    search,
    editingStudent,
    addOpen,
    genderFilters,
    classFilters,
    sortBy,
    sortOrder,
    setPage,
    setEditingStudent,
    setAddOpen,
  } = useStudentStore();

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, genderFilters, classFilters, sortBy, sortOrder, setPage]);

  // Queries
  const { data, isLoading, isError, refetch } = useQuery<StudentResponse>({
    queryKey: [
      "students",
      page,
      pageSize,
      debouncedSearch,
      genderFilters,
      classFilters,
      sortBy,
      sortOrder,
    ],
    queryFn: async () => {
      const params: Record<string, any> = {
        page,
        page_size: pageSize,
        sort_order: sortOrder,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (genderFilters.length > 0) params.gender = genderFilters;
      if (classFilters.length > 0) params.class_prefix = classFilters;
      if (sortBy) params.sort_by = sortBy;

      const res = await axios.get("http://localhost:8000/students/", {
        params,
        paramsSerializer: (params) => {
          const search = new URLSearchParams();
          Object.keys(params).forEach((key) => {
            const value = params[key];
            if (Array.isArray(value)) {
              value.forEach((v) => search.append(key, v));
            } else if (value !== undefined && value !== null) {
              search.append(key, value);
            }
          });
          return search.toString();
        },
      });
      return res.data;
    },
    keepPreviousData: true,
  });

  // Mutations
  const addStudentMutation = useMutation({
    mutationFn: (newStudent: StudentFormInputs) =>
      axios.post("http://localhost:8000/students/", newStudent),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["students", page, pageSize, debouncedSearch, genderFilters, classFilters, sortBy, sortOrder],
      });
      setAddOpen(false);
    },
  });

  const updateStudentMutation = useMutation({
    mutationFn: (updatedStudent: Student) =>
      axios.put(
        `http://localhost:8000/students/${updatedStudent.id}`,
        updatedStudent
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["students", page, pageSize, debouncedSearch, genderFilters, classFilters, sortBy, sortOrder],
      });
      setEditingStudent(null);
    },
  });

  const deleteStudentMutation = useMutation({
    mutationFn: (studentId: number) =>
      axios.delete(`http://localhost:8000/students/${studentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["students", page, pageSize, debouncedSearch, genderFilters, classFilters, sortBy, sortOrder],
      });
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <StudentControlPanel
        totalStudents={data?.total ?? 0}
      />

      <main className="flex-1 overflow-x-auto px-6 py-4">
        {isLoading && <p>Loading...</p>}
        {isError && <p>Error loading students.</p>}

        {!isLoading && !isError && (
          <StudentTable
            students={data?.items || []}
            page={page}
            pageSize={pageSize}
            totalPages={data ? Math.ceil(data.total / pageSize) : 1}
            setPage={setPage}
            handleDelete={deleteStudentMutation.mutate}
            handleEdit={(student) => setEditingStudent(student)}
          />
        )}
      </main>

      <StudentAddDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={addStudentMutation.mutate}
      />
      <StudentEditDialog
        open={!!editingStudent}
        onOpenChange={() => setEditingStudent(null)}
        onSubmit={updateStudentMutation.mutate}
        editingStudent={editingStudent}
      />
      <StudentViewDialog />
    </div>
  );
}