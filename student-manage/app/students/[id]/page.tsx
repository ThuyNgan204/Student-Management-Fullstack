"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { Student } from "@/store/useStudentStore";
import { Button } from "@/components/ui/button";

function formatDate(dateStr: string): string {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN");
}

export default function StudentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id;

  const {
    data: student,
    isLoading,
    isError,
  } = useQuery<Student>({
    queryKey: ["student", studentId],
    queryFn: async () => {
      const res = await axios.get(
        `http://localhost:8000/students/${studentId}`
      );
      return res.data;
    },
    enabled: !!studentId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (isError || !student) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <p className="text-xl text-red-500 mb-4">
          Error: Student not found or could not be loaded.
        </p>
        <Button onClick={() => router.push("/students")}>
          Back to Students
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-primary">
          Student Detail
        </h1>
        <ul className="space-y-4 text-lg text-gray-800">
          <li>
            <strong>ID:</strong> {student.id}
          </li>
          <li>
            <strong>Name:</strong> {student.last_name} {student.first_name}
          </li>
          <li>
            <strong>Class:</strong> {student.class_name}
          </li>
          <li>
            <strong>Gender:</strong> {student.gender}
          </li>
          <li>
            <strong>Date of Birth:</strong> {formatDate(student.dob)}
          </li>
          <li>
            <strong>Created At:</strong> {formatDate(student.created_at)}
          </li>
          <li>
            <strong>Updated At:</strong> {formatDate(student.updated_at)}
          </li>
        </ul>
        <div className="mt-8 text-center">
          <Button onClick={() => router.push("/students")}>
            Back to Students
          </Button>
        </div>
      </div>
    </div>
  );
}