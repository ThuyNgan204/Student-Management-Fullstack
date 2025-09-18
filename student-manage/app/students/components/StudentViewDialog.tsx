"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useStudentStore } from "@/store/useStudentStore";

function formatDate(dateStr: string): string {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN");
}

export default function StudentViewDialog() {
  const { selectedStudent, setSelectedStudent } = useStudentStore();

  return (
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
  );
}