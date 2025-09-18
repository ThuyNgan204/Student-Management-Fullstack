"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useStudentStore, Student } from "@/store/useStudentStore";
import Link from "next/link";

// shadcn components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ControlPanel from "@/components/shared/ControlPanel";
import DataTable from "@/components/shared/DataTable";

// Schema
const studentSchema = z.object({
  last_name: z.string().min(1, { message: "Please enter a last name!" }),
  first_name: z.string().min(1, { message: "Please enter a first name!" }),
  class_name: z.string().min(1, { message: "Please enter a class!" }),
  gender: z.string().min(1, { message: "Please enter a gender!" }),
  dob: z.string().min(1, { message: "Please select date of birth!" }),
});
type StudentFormInputs = z.infer<typeof studentSchema>;

type StudentResponse = {
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

export default function Home() {
  const queryClient = useQueryClient();

  const {
    page,
    pageSize,
    search,
    editingStudent,
    selectedStudent,
    addOpen,
    openFilter,
    genderFilters,
    classFilters,
    sortBy,
    sortOrder,
    setPage,
    setPageSize,
    setSearch,
    setEditingStudent,
    setSelectedStudent,
    setAddOpen,
    setOpenFilter,
    setGenderFilters,
    setClassFilters,
    setSortBy,
    setSortOrder,
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
    defaultValues: { last_name: "", first_name: "", class_name: "", gender: "", dob: "" },
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
  const { data, isLoading, isError } = useQuery<StudentResponse>({
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
      resetAdd();
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
      resetEdit();
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

  // Handlers
  const onSubmitAdd = (data: StudentFormInputs) => {
    addStudentMutation.mutate(data);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    resetEdit({
      last_name: student.last_name,
      first_name: student.first_name,
      class_name: student.class_name,
      gender: student.gender,
      dob: student.dob,
    });
  };

  const handleUpdate = (data: StudentFormInputs) => {
    if (editingStudent) {
      updateStudentMutation.mutate({ ...editingStudent, ...data });
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

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN");
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-6 py-4 hover:bg-primary/90">
        <h1 className="text-2xl text-center font-bold">STUDENT MANAGEMENT</h1>
      </header>

      {/* Top Controls */}
      <div className="px-6 py-4 border-b border-gray-300 bg-gray-50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Button onClick={() => setAddOpen(true)}>Add Student</Button>

        <div className="relative w-full md:w-80">
          <Input
            placeholder="Search student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              X
            </button>
          )}
        </div>
      </div>

    {/* Control Panel */}
      <ControlPanel
        total={data?.total ?? 0}
      />

      {/* Table */}
      <main className="flex-1 overflow-x-auto px-6 py-4">
        {isLoading && <p>Loading...</p>}
        {isError && <p>Error loading students.</p>}

        {!isLoading && !isError && (
          <>
            <DataTable
  columns={[
    { key: "id", header: "ID" },
    {
      key: "last_name",
      header: "Last Name",
      render: (s) => (
        <Link
          href={`/students/${s.id}`}
          className="text-primary hover:underline hover:text-primary/80"
        >
          {s.last_name}
        </Link>
      ),
    },
    {
      key: "first_name",
      header: "First Name",
      render: (s) => (
        <Link
          href={`/students/${s.id}`}
          className="text-primary hover:underline hover:text-primary/80"
        >
          {s.first_name}
        </Link>
      ),
    },
    { key: "gender", header: "Gender" },
    { key: "dob", header: "Date of Birth", render: (s) => formatDate(s.dob) },
    { key: "class_name", header: "Class" },
    { key: "created_at", header: "Created At", render: (s) => formatDate(s.created_at) },
    { key: "updated_at", header: "Updated At", render: (s) => formatDate(s.updated_at) },
    {
      key: "actions",
      header: "Actions",
      className: "text-center",
      render: (s) => (
        <div className="space-x-2">
          <Button variant="secondary" onClick={() => handleView(s.id)}>View</Button>
          <Button variant="default" onClick={() => handleEdit(s)}>Edit</Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">Delete</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the student from the system.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteStudentMutation.mutate(student.id)}>
                              Continue
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
      ),
    },
  ]}
    data={isError || isLoading ? [] : data?.items || []}
    emptyMessage={isError ? "Error loading students" : "No students found"}
/>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>
                {"<"}
              </Button>

              {[...Array(totalPages)].map((_, i) => (
                <Button key={i + 1} variant={page === i + 1 ? "default" : "outline"} onClick={() => setPage(i + 1)}>
                  {i + 1}
                </Button>
              ))}

              <Button variant="outline" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                {">"}
              </Button>
            </div>
          </>
        )}
      </main>

      {/* Add Student Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Student</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitAdd(onSubmitAdd)} className="space-y-4">
            <div>
              <Label className="mb-2">Last Name</Label>
              <Input {...registerAdd("last_name")} />
              {errorsAdd.last_name && <p className="text-xs text-red-500">{errorsAdd.last_name.message}</p>}
            </div>
            <div>
              <Label className="mb-2">First Name</Label>
              <Input {...registerAdd("first_name")} />
              {errorsAdd.first_name && <p className="text-xs text-red-500">{errorsAdd.first_name.message}</p>}
            </div>

            <div>
              <Label className="mb-2">Class</Label>
              <Input {...registerAdd("class_name")} />
              {errorsAdd.class_name && <p className="text-xs text-red-500">{errorsAdd.class_name.message}</p>}
            </div>

            {/* Gender select */}
            <div>
              <Label className="mb-2">Gender</Label>
              <select {...registerAdd("gender")} className="border rounded px-2 py-1 w-full">
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {errorsAdd.gender && <p className="text-xs text-red-500">{errorsAdd.gender.message}</p>}
            </div>

            <div>
              <Label className="mb-2">Date of Birth</Label>
              <Input type="date" {...registerAdd("dob")} />
              {errorsAdd.dob && <p className="text-xs text-red-500">{errorsAdd.dob.message}</p>}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Student Modal */}
      <Dialog open={!!editingStudent} onOpenChange={() => setEditingStudent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          {editingStudent && (
            <form onSubmit={handleSubmitEdit(handleUpdate)} className="space-y-4">
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
                <Label className="mb-2">Class</Label>
                <Input {...registerEdit("class_name")} />
                {errorsEdit.class_name && <p className="text-xs text-red-500">{errorsEdit.class_name.message}</p>}
              </div>

              {/* Gender select */}
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

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingStudent(null)}>
                  Cancel
                </Button>
                <Button type="submit">Update</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Student Detail</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <ul className="space-y-2">
              <li>
                <strong>ID:</strong> {selectedStudent.id}
              </li>
              <li>
                <strong>Name:</strong> {selectedStudent.last_name} {selectedStudent.first_name}
              </li>
              <li>
                <strong>Class:</strong> {selectedStudent.class_name}
              </li>
              <li>
                <strong>Gender:</strong> {selectedStudent.gender}
              </li>
              <li>
                <strong>Date of Birth:</strong> {formatDate(selectedStudent.dob)}
              </li>
              <li>
                <strong>Created At:</strong> {formatDate(selectedStudent.created_at)}
              </li>
              <li>
                <strong>Updated At:</strong> {formatDate(selectedStudent.updated_at)}
              </li>
            </ul>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedStudent(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

