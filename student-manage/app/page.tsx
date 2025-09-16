"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useStudentStore, Student } from "@/store/useStudentStore";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

// Schema
const studentSchema = z.object({
  name: z.string().min(1, { message: "Please enter a name!" }),
  class_name: z.string().min(1, { message: "Please enter a class!" }),
});
type StudentFormInputs = z.infer<typeof studentSchema>;

// Debounce Hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

type StudentResponse = {
  items: Student[];
  total: number;
};

export default function Home() {
  const queryClient = useQueryClient();

  const {
    page,
    pageSize,
    search,
    editingStudent,
    selectedStudent,
    setPage,
    setPageSize,
    setSearch,
    setEditingStudent,
    setSelectedStudent,
  } = useStudentStore();

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, setPage]);

  // --- Form Add ---
  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAdd,
    formState: { errors: errorsAdd },
    clearErrors,
  } = useForm<StudentFormInputs>({
    resolver: zodResolver(studentSchema),
    defaultValues: { name: "", class_name: "" },
  });

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        clearErrors(); // chỉ clear khi click ngoài form
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [clearErrors]);

  // --- Form Edit ---
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit },
  } = useForm<StudentFormInputs>({
    resolver: zodResolver(studentSchema),
  });

  // Queries
  const { data, isLoading, isError } = useQuery<StudentResponse>({
    queryKey: ["students", page, pageSize, debouncedSearch],
    queryFn: async () => {
      const res = await axios.get(
        `http://localhost:8000/students/?page=${page}&page_size=${pageSize}&search=${debouncedSearch}`
      );
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
        queryKey: ["students", page, pageSize, debouncedSearch],
      });
      resetAdd();
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
        queryKey: ["students", page, pageSize, debouncedSearch],
      });
      setEditingStudent(null);
      resetEdit();
    },
  });

  const deleteStudentMutation = useMutation({
    mutationFn: (studentId: number) =>
      axios.delete(`http://localhost:8000/students/${studentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["students", page, pageSize, debouncedSearch],
      });
    },
  });

  // Handlers
  const onSubmitAdd = (data: StudentFormInputs) => {
    addStudentMutation.mutate(data);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    resetEdit({ name: student.name, class_name: student.class_name });
  };

  const handleUpdate = (data: StudentFormInputs) => {
    if (editingStudent) {
      updateStudentMutation.mutate({ ...editingStudent, ...data });
    }
  };

  const handleDelete = (studentId: number) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      deleteStudentMutation.mutate(studentId);
    }
  };

  const handleView = async (studentId: number) => {
    try {
      const res = await axios.get(`http://localhost:8000/students/${studentId}`);
      setSelectedStudent(res.data);
    } catch (err) {
      alert("Failed to load student detail");
    }
  };

  const totalPages = data ? Math.ceil(data.total / pageSize) : 1;

  // UI
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      {/* Header */}
      <header className="bg-indigo-600 text-white px-6 py-4">
        <h1 className="text-2xl font-bold">Student Management</h1>
      </header>

      {/* Top Controls: Add Form (left) + Search (right) */}
      <div className="px-6 py-4 border-b border-gray-300 bg-gray-50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Form Add Student */}
          <form
            ref={formRef}
            onSubmit={handleSubmitAdd(onSubmitAdd)}
            className="flex flex-col md:flex-row md:items-center gap-3 flex-1"
          >
            {/* Name input */}
            <div className="flex flex-col w-72 relative">
              <input
                type="text"
                placeholder="Name"
                {...registerAdd("name")}
                className={`w-72 border rounded-md px-3 py-2 ${
                  errorsAdd.name ? "border-red-500" : "border border-black-300"
                }`}
              />
              {errorsAdd.name && (
                <span className="absolute top-full left-0 text-xs text-red-500">
                  {errorsAdd.name.message}
                </span>
              )}
            </div>

            {/* Class input */}
            <div className="flex flex-col w-42 relative">
              <input
                type="text"
                placeholder="Class"
                {...registerAdd("class_name")}
                className={`w-42 border rounded-md px-3 py-2 ${
                  errorsAdd.class_name ? "border-red-500" : "border border-black-300"
                }`}
              />
              {errorsAdd.class_name && (
                <span className="absolute top-full left-0 text-xs text-red-500">
                  {errorsAdd.class_name.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md font-semibold"
            >
              Add
            </button>
          </form>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 pr-8 rounded-md border text-black w-full"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
              >
                ❌
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 my-4 px-6">
        <label htmlFor="pageSize" className="text-sm text-gray-600">
          Rows per page:
        </label>
        <select
          id="pageSize"
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(1);
          }}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      {/* Table */}
      <main className="flex-1 overflow-x-auto px-6 py-4">
        {isLoading && <p className="text-center mt-6 text-gray-600">Loading...</p>}
        {isError && <p className="text-center mt-6 text-red-600">Error loading students.</p>}

        {!isLoading && !isError && (
          <>
            <table className="w-full border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 border text-left w-16">ID</th>
                  <th className="p-3 border text-left">Name</th>
                  <th className="p-3 border text-left">Class</th>
                  <th className="p-3 border text-center w-72">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.items.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="p-3 border">{student.id}</td>
                    <td className="p-3 border">{student.name}</td>
                    <td className="p-3 border">{student.class_name}</td>
                    <td className="p-3 border text-center space-x-2">
                      <button
                        onClick={() => handleView(student.id)}
                        className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(student)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {data?.items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center p-4 text-gray-500 italic">
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
              >
                {"<"}
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 rounded ${
                    page === i + 1 ? "bg-indigo-600 text-white" : "bg-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
              >
                {">"}
              </button>
            </div>
          </>
        )}
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <motion.div
            className="fixed inset-0 bg-white/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <button
                onClick={() => setSelectedStudent(null)}
                className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-200"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              <h2 className="text-xl font-bold mb-4">Student Detail</h2>
              <ul className="space-y-2 text-sm text-gray-700">
                <li><strong>ID:</strong> {selectedStudent.id}</li>
                <li><strong>Name:</strong> {selectedStudent.name}</li>
                <li><strong>Class:</strong> {selectedStudent.class_name}</li>
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingStudent && (
          <motion.div
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <button
                onClick={() => setEditingStudent(null)}
                className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-200"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              <h2 className="text-xl font-bold mb-4">Edit Student</h2>

              <form
                onSubmit={handleSubmitEdit(handleUpdate)}
                className="flex flex-col gap-4"
              >
                {/* ID */}
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">ID</label>
                  <input
                    type="text"
                    value={editingStudent.id}
                    readOnly
                    className="px-3 py-2 rounded-md border text-gray-500 bg-gray-100 cursor-not-allowed"
                  />
                </div>

                {/* Name */}
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">Name</label>
                  <input
                    type="text"
                    {...registerEdit("name")}
                    className="px-3 py-2 rounded-md border text-black"
                  />
                  {errorsEdit.name && (
                    <span className="text-red-600 text-sm">{errorsEdit.name.message}</span>
                  )}
                </div>

                {/* Class */}
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">Class</label>
                  <input
                    type="text"
                    {...registerEdit("class_name")}
                    className="px-3 py-2 rounded-md border text-black"
                  />
                  {errorsEdit.class_name && (
                    <span className="text-red-600 text-sm">{errorsEdit.class_name.message}</span>
                  )}
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setEditingStudent(null)}
                    className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
