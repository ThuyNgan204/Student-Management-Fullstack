"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  // Map đường dẫn -> title
  const titles: Record<string, string> = {
    "/": "TRANG CHỦ",
    "/students": "QUẢN LÝ SINH VIÊN",
    "/teachers": "QUẢN LÝ GIẢNG VIÊN",
    "/departments": "QUẢN LÝ KHOA",
    "/majors": "QUẢN LÝ CHUYÊN NGÀNH",
    "/classes": "QUẢN LÝ LỚP SINH HOẠT",
    "/courses": "QUẢN LÝ KHÓA HỌC",
    "/enrollment": "QUẢN LÝ ĐĂNG KÝ",
    "/class_section": "QUẢN LÝ LỚP HỌC PHẦN",
    "/grades": "QUẢN LÝ ĐIỂM",
    "/reports": "BÁO CÁO - THỐNG KÊ",
    "/accounts": "QUẢN LÝ TÀI KHOẢN",
  };

  const title = titles[pathname] || "Dashboard";

  return (
    <div className="flex justify-between items-center h-16 px-6 border-b bg-white shadow-sm">
      <h1 className="text-xl font-semibold">{title}</h1>
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
