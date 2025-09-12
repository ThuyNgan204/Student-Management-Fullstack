"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// ---------------- Schema ----------------
interface Student {
  id: number;
  name: string;
  class_name: string;
  age?: number;
  gender?: string;
  email?: string;
  phone?: string;
  address?: string;
  enrollment_date?: string;
  gpa?: number;
  status?: string;
}

const studentSchema = z.object({
  name: z.string().min(1, { message: "Please enter a name!" }),
  class_name: z.string().min(1, { message: "Please enter a class!" }),
});

type StudentFormInputs = z.infer<typeof studentSchema>;

// ---------------- Debounce Hook ----------------
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

// ---------------- Main Component ----------------
export default function Home() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null); // student detail

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<StudentFormInputs>({
    resolver: zodResolver(studentSchema),
    defaultValues: { name: "", class_name: "" },
  });

  // ---------------- Queries ----------------
  const { data: students, isLoading, isError } = useQuery<Student[]>({
    queryKey: ["students", page, debouncedSearch],
    queryFn: async () => {
      const res = await axios.get(
        `http://localhost:8000/students/?page=${page}&page_size=10&search=${debouncedSearch}`
      );
      return res.data;
    },
    keepPreviousData: true,
  });

  // ---------------- Mutations ----------------
  const addStudentMutation = useMutation({
    mutationFn: (newStudent: StudentFormInputs) =>
      axios.post("http://localhost:8000/students/", newStudent),
    onSuccess: (res) => {
      queryClient.setQueryData<Student[]>(["students", page, debouncedSearch], (old) => {
        if (!old) return [res.data];
        return [res.data, ...old];
      });
      reset();
    },
  });

  const updateStudentMutation = useMutation({
    mutationFn: (updatedStudent: Student) =>
      axios.put(
        `http://localhost:8000/students/${updatedStudent.id}`,
        updatedStudent
      ),
    onSuccess: (res) => {
      queryClient.setQueryData<Student[]>(["students", page, debouncedSearch], (old) => {
        if (!old) return [];
        return old.map((s) => (s.id === res.data.id ? res.data : s));
      });
      setEditingStudent(null);
      reset();
    },
  });

  const deleteStudentMutation = useMutation({
    mutationFn: (studentId: number) =>
      axios.delete(`http://localhost:8000/students/${studentId}`),
    onSuccess: (_, studentId) => {
      queryClient.setQueryData<Student[]>(["students", page, debouncedSearch], (old) => {
        if (!old) return [];
        return old.filter((s) => s.id !== studentId);
      });
    },
  });

  // ---------------- Handlers ----------------
  const onSubmit = (data: StudentFormInputs) => {
    if (editingStudent) {
      updateStudentMutation.mutate({ ...editingStudent, ...data });
    } else {
      addStudentMutation.mutate(data);
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setValue("name", student.name);
    setValue("class_name", student.class_name);
  };

  const handleCancelEdit = () => {
    setEditingStudent(null);
    reset();
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

  // ---------------- UI ----------------
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      {/* Header */}
      <header className="bg-indigo-600 text-white px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Student Management</h1>

        {/* Search Box */}
        <input
          type="text"
          placeholder="Search student..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 rounded-md text-black w-full md:w-64"
        />
      </header>

      {/* Form Add/Edit Student */}
      <div className="px-6 py-4 border-t border-gray-300 bg-gray-50">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col md:flex-row md:items-center gap-3"
        >
          <input
            type="text"
            placeholder="Name"
            {...register("name")}
            className="px-3 py-2 rounded-md border text-black"
          />
          <input
            type="text"
            placeholder="Class"
            {...register("class_name")}
            className="px-3 py-2 rounded-md border text-black"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md font-semibold"
          >
            {editingStudent ? "Save" : "Add Student"}
          </button>
          {editingStudent && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-md font-semibold"
            >
              Cancel
            </button>
          )}
        </form>

        {/* Table */}
        <main className="flex-1 overflow-x-auto px-6 py-4">
          {isLoading && <p className="text-center mt-6 text-gray-600">Loading...</p>}
          {isError && <p className="text-center mt-6 text-red-600">Error loading students.</p>}

          {!isLoading && !isError && (
            <table className="w-full border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 border text-left">Name</th>
                  <th className="p-3 border text-left">Class</th>
                  <th className="p-3 border text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students?.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
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
                {students?.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center p-4 text-gray-500 italic">
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </main>
      </div>

      {/* Pagination */}
      <footer className="flex justify-center items-center gap-4 py-4 border-t border-gray-300">
        <button
          onClick={() => setPage((old) => Math.max(old - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded disabled:opacity-50 hover:bg-gray-400"
        >
          Previous
        </button>
        <span className="font-semibold">Page {page}</span>
        <button
          onClick={() => setPage((old) => old + 1)}
          disabled={!students || students.length < 10}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded disabled:opacity-50 hover:bg-gray-400"
        >
          Next
        </button>
      </footer>

      {/* Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Student Detail</h2>
            <ul className="space-y-2 text-sm text-gray-700">
              <li><strong>ID:</strong> {selectedStudent.id}</li>
              <li><strong>Name:</strong> {selectedStudent.name}</li>
              <li><strong>Class:</strong> {selectedStudent.class_name}</li>
              {selectedStudent.age && <li><strong>Age:</strong> {selectedStudent.age}</li>}
              {selectedStudent.gender && <li><strong>Gender:</strong> {selectedStudent.gender}</li>}
              {selectedStudent.email && <li><strong>Email:</strong> {selectedStudent.email}</li>}
              {selectedStudent.phone && <li><strong>Phone:</strong> {selectedStudent.phone}</li>}
              {selectedStudent.address && <li><strong>Address:</strong> {selectedStudent.address}</li>}
              {selectedStudent.enrollment_date && <li><strong>Enrolled:</strong> {selectedStudent.enrollment_date}</li>}
              {selectedStudent.gpa && <li><strong>GPA:</strong> {selectedStudent.gpa}</li>}
              {selectedStudent.status && <li><strong>Status:</strong> {selectedStudent.status}</li>}
            </ul>
            <button
              onClick={() => setSelectedStudent(null)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
