"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as z from "zod";
import { UserAccount } from "@/app/(admin)/accounts/page";

// Schema
const userSchema = z.object({
  username: z.string().min(1, "Username là bắt buộc"),
  password: z.string().optional(),
  role: z.string().min(1, "Role là bắt buộc"),
  is_active: z.boolean(),
});

export type UserFormInputs = z.infer<typeof userSchema>;

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  initialData?: UserAccount;
  onSubmit: (data: UserFormInputs) => void;
}

export default function UserForm({ open, onClose, initialData, onSubmit }: UserFormProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<UserFormInputs>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: initialData?.username || "",
      password: "",
      role: initialData?.role || "student",
      is_active: initialData?.is_active ?? true,
    },
  });

  useEffect(() => {
    reset({
      username: initialData?.username || "",
      password: "",
      role: initialData?.role || "student",
      is_active: initialData?.is_active ?? true,
    });
  }, [initialData, reset]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          {initialData ? "Chỉnh sửa người dùng" : "Thêm người dùng"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Username</Label>
            <Input {...register("username")} />
            {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
          </div>

          {!initialData && (
            <div>
              <Label>Password</Label>
              <Input type="password" {...register("password")} placeholder="Mặc định: username" />
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>
          )}

          <div>
            <Label>Role</Label>
            <select {...register("role")} className="border rounded px-2 py-1 w-full">
              <option value="student">Student</option>
              <option value="lecturer">Lecturer</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role && <p className="text-xs text-red-500">{errors.role.message}</p>}
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" {...register("is_active")} id="is_active" className="w-4 h-4"/>
            <Label htmlFor="is_active">Active</Label>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
            <Button type="submit">{initialData ? "Cập nhật" : "Thêm"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
