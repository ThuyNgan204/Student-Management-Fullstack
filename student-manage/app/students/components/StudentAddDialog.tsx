"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StudentFormInputs } from "../page";

type StudentAddDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: StudentFormInputs) => void;
};

// Schema
const studentSchema = z.object({
  last_name: z.string().min(1, { message: "Please enter a last name!" }),
  first_name: z.string().min(1, { message: "Please enter a first name!" }),
  class_name: z.string().min(1, { message: "Please enter a class!" }),
  gender: z.string().min(1, { message: "Please enter a gender!" }),
  dob: z.string().min(1, { message: "Please select date of birth!" }),
});

export default function StudentAddDialog({
  open,
  onOpenChange,
  onSubmit,
}: StudentAddDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentFormInputs>({
    resolver: zodResolver(studentSchema),
    defaultValues: { last_name: "", first_name: "", class_name: "", gender: "", dob: "" },
  });

  const handleClose = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
    }
    onOpenChange(newOpen);
  };

  const handleFormSubmit = (data: StudentFormInputs) => {
    onSubmit(data);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Student</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <Label className="mb-2">Last Name</Label>
            <Input {...register("last_name")} />
            {errors.last_name && <p className="text-xs text-red-500">{errors.last_name.message}</p>}
          </div>
          <div>
            <Label className="mb-2">First Name</Label>
            <Input {...register("first_name")} />
            {errors.first_name && <p className="text-xs text-red-500">{errors.first_name.message}</p>}
          </div>
          <div>
            <Label className="mb-2">Class</Label>
            <Input {...register("class_name")} />
            {errors.class_name && <p className="text-xs text-red-500">{errors.class_name.message}</p>}
          </div>
          <div>
            <Label className="mb-2">Gender</Label>
            <select {...register("gender")} className="border rounded px-2 py-1 w-full">
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            {errors.gender && <p className="text-xs text-red-500">{errors.gender.message}</p>}
          </div>
          <div>
            <Label className="mb-2">Date of Birth</Label>
            <Input type="date" {...register("dob")} />
            {errors.dob && <p className="text-xs text-red-500">{errors.dob.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}