"use client";

import { useStudentStore, Student } from "@/store/useStudentStore";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { selectedStudent } = useStudentStore();

  // React Query fetch dữ liệu student
  const { data: student, isLoading, isError } = useQuery<Student>({
    queryKey: ["student", id],
    queryFn: async () => {
      const res = await axios.get<Student>(`http://localhost:8000/students/${id}`);
      return res.data;
    },
    // Nếu trong store đã có student đúng id thì không fetch lại
    enabled: !selectedStudent || selectedStudent.id.toString() !== id,
    initialData: selectedStudent && selectedStudent.id.toString() === id ? selectedStudent : undefined,
  });

  if (isLoading) return <p className="p-6">Loading...</p>;
  if (isError) return <p className="p-6 text-red-500">Error loading student</p>;
  if (!student) return <p className="p-6 text-gray-500">Student not found</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Student Detail</h1>
      <ul className="space-y-2">
        <li>
          <strong>ID:</strong> {student.id}
        </li>
        <li>
          <strong>Name:</strong> {student.name}
        </li>
        <li>
          <strong>Class:</strong> {student.class_name}
        </li>
      </ul>

      <button
        onClick={() => router.push("/")}
        className="mt-6 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
      >
        Back
      </button>
    </div>
  );
}
