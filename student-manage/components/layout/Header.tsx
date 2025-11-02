"use client";

import { Button } from "@/components/ui/button";
import { FoldHorizontal, UnfoldHorizontal } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Header({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const segments = pathname.split("/").filter(Boolean);
  const main = segments[0]; 
  const sub = segments[1];  
  const extra = segments[2]; 

  let title = "Dashboard";

  if (main === "students") {
    if (extra === "grades") title = "XEM ĐIỂM";
    else if (sub) title = "THÔNG TIN SINH VIÊN";
    else title = "QUẢN LÝ SINH VIÊN";
  } 
  else if (main === "lecturers") {
    title = sub ? "THÔNG TIN GIẢNG VIÊN" : "QUẢN LÝ GIẢNG VIÊN";
  } 
  else if (main === "departments") title = "QUẢN LÝ KHOA";
  else if (main === "majors") title = "QUẢN LÝ CHUYÊN NGÀNH";
  else if (main === "academic_class") {
    if (extra === "students") title = "DANH SÁCH SINH VIÊN";
    else if (sub) title = "";
    else title = "QUẢN LÝ LỚP SINH HOẠT";
  } 
  else if (main === "courses") title = "QUẢN LÝ HỌC PHẦN";
  else if (main === "enrollment") title = "QUẢN LÝ ĐĂNG KÝ";
  else if (main === "class_section") {
    if (extra === "students") title = "DANH SÁCH SINH VIÊN";
    else if (sub) title = "";
    else title = "QUẢN LÝ LỚP HỌC PHẦN";
  }  
  else if (main === "grades")
    title = sub ? "XEM ĐIỂM CHI TIẾT" : "QUẢN LÝ ĐIỂM";
  else if (main === "major_courses") title = "CHƯƠNG TRÌNH ĐÀO TẠO";
  else if (main === "accounts") title = "QUẢN LÝ TÀI KHOẢN";
  else if (pathname === "/") title = "TỔNG QUAN";

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Đăng xuất thành công");
      router.push("/login");
    } catch (error) {
      console.error(error);
      toast.error("Đăng xuất thất bại");
    }
  };

  return (
    <div className="flex justify-between items-center h-16 px-6 border-b bg-white shadow-sm">
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

      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={handleLogout}>
          Đăng xuất
        </Button>
      </div>
    </div>
  );
}
