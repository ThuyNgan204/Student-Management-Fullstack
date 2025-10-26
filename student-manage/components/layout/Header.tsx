"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";
import { UnfoldHorizontal, FoldHorizontal } from "lucide-react";

export default function Header({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}) {
  const pathname = usePathname();

  // Phân tích segment từ pathname, ví dụ: /lecturers/1 -> ["", "lecturers", "1"]
  const segments = pathname.split("/");
  const lecturerId = segments[2];
  const studentId = segments[2];

  let title = "Dashboard";

  if (pathname.startsWith("/students"))
   title = studentId ? "THÔNG TIN SINH VIÊN" : "QUẢN LÝ SINH VIÊN";
  else if (pathname.startsWith("/lecturers"))
    title = lecturerId ? "THÔNG TIN GIẢNG VIÊN" : "QUẢN LÝ GIẢNG VIÊN";
  else if (pathname.startsWith("/departments")) title = "QUẢN LÝ KHOA";
  else if (pathname.startsWith("/majors")) title = "QUẢN LÝ CHUYÊN NGÀNH";
  else if (pathname.startsWith("/academic_class")) title = "QUẢN LÝ LỚP SINH HOẠT";
  else if (pathname.startsWith("/courses")) title = "QUẢN LÝ HỌC PHẦN";
  else if (pathname.startsWith("/enrollment")) title = "QUẢN LÝ ĐĂNG KÝ";
  else if (pathname.startsWith("/class_section")) title = "QUẢN LÝ LỚP HỌC PHẦN";
  else if (pathname.startsWith("/grades")) title = "QUẢN LÝ ĐIỂM";
  else if (pathname.startsWith("/major_courses")) title = "QUẢN LÝ CHƯƠNG TRÌNH ĐÀO TẠO";
  else if (pathname.startsWith("/accounts")) title = "QUẢN LÝ TÀI KHOẢN";
  else if (pathname === "/") title = "TRANG CHỦ";

  return (
    <div className="flex justify-between items-center h-16 px-6 border-b bg-white shadow-sm">
      {/* Nút toggle sidebar + title */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center p-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          {collapsed ? (
            <UnfoldHorizontal className="size-4" />
          ) : (
            <FoldHorizontal className="size-4" />
          )}
        </button>
        <h1 className="text-gray-300">|</h1>
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>

      {/* Avatar + Settings */}
      <div className="flex items-center gap-4">
        <Button variant="outline">Settings</Button>
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>AD</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
