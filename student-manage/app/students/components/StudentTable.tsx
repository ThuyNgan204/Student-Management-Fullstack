import React from "react";
import Link from "next/link";
import { Student } from "@/store/useStudentStore";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useStudentStore } from "@/store/useStudentStore";

type StudentTableProps = {
  students: Student[];
  page: number;
  pageSize: number;
  totalPages: number;
  setPage: (page: number) => void;
  handleDelete: (studentId: number) => void;
  handleEdit: (student: Student) => void;
};

function formatDate(dateStr: string): string {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN");
}

export default function StudentTable({
  students,
  page,
  totalPages,
  setPage,
  handleDelete,
  handleEdit,
}: StudentTableProps) {
  const { setSelectedStudent } = useStudentStore();

  const handleView = async (student: Student) => {
    setSelectedStudent(student);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-300">
            <TableHead className="w-20 p-3 border">ID</TableHead>
            <TableHead className="w-32 p-3 border">Last Name</TableHead>
            <TableHead className="w-20 p-3 border">First Name</TableHead>
            <TableHead className="w-32 p-3 border">Gender</TableHead>
            <TableHead className="w-40 p-3 border">Date of Birth</TableHead>
            <TableHead className="w-32 p-3 border">Class</TableHead>
            <TableHead className="w-48 p-3 border">Created At</TableHead>
            <TableHead className="w-48 p-3 border">Updated At</TableHead>
            <TableHead className="w-40 p-3 border text-center">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.length > 0 ? (
            students.map((student) => (
              <TableRow key={student.id} className="border">
                <TableCell className="border">{student.id}</TableCell>
                <TableCell className="border">
                  <Link
                    href={`/students/${student.id}`}
                    className="text-primary hover:underline hover:text-primary/80"
                  >
                    {student.last_name}
                  </Link>
                </TableCell>
                <TableCell className="border">
                  <Link
                    href={`/students/${student.id}`}
                    className="text-primary hover:underline hover:text-primary/80"
                  >
                    {student.first_name}
                  </Link>
                </TableCell>
                <TableCell className="border">{student.gender}</TableCell>
                <TableCell className="border">{formatDate(student.dob)}</TableCell>
                <TableCell className="border">{student.class_name}</TableCell>
                <TableCell className="border">{formatDate(student.created_at)}</TableCell>
                <TableCell className="border">{formatDate(student.updated_at)}</TableCell>
                <TableCell className="space-x-2 text-center">
                  <Button variant="secondary" onClick={() => handleView(student)}>
                    View
                  </Button>
                  <Button variant="default" onClick={() => handleEdit(student)}>
                    Edit
                  </Button>
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
                        <AlertDialogAction onClick={() => handleDelete(student.id)}>
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow className="border">
              <TableCell colSpan={9} className="text-center border">
                No students found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 mt-4">
        <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>
          {"<"}
        </Button>
        {[...Array(totalPages)].map((_, i) => (
          <Button
            key={i + 1}
            variant={page === i + 1 ? "default" : "outline"}
            onClick={() => setPage(i + 1)}
          >
            {i + 1}
          </Button>
        ))}
        <Button
          variant="outline"
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          {">"}
        </Button>
      </div>
    </>
  );
}