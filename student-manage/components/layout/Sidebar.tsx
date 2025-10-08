"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  FileText,
  UserCog,
  Building2,
  Layers,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "TRANG CHỦ", href: "/", icon: LayoutDashboard },
  { name: "QUẢN LÝ SINH VIÊN", href: "/students", icon: Users },
  { name: "QUẢN LÝ GIẢNG VIÊN", href: "/teachers", icon: UserCog },
  { name: "QUẢN LÝ KHOA", href: "/departments", icon: Building2 },
  { name: "QUẢN LÝ CHUYÊN NGÀNH", href: "/majors", icon: GraduationCap },
  { name: "QUẢN LÝ LỚP SINH HOẠT", href: "/classes", icon: ClipboardList },
  { name: "QUẢN LÝ KHÓA HỌC", href: "/courses", icon: BookOpen },
  { name: "QUẢN LÝ ĐĂNG KÝ", href: "/enrollment", icon: UserPlus },
  { name: "QUẢN LÝ LỚP HỌC PHẦN", href: "/class_section", icon: Layers },
  { name: "QUẢN LÝ ĐIỂM", href: "/grades", icon: FileText },
  { name: "BÁO CÁO - THỐNG KÊ", href: "/reports", icon: FileText },
  { name: "QUẢN LÝ TÀI KHOẢN", href: "/accounts", icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-full w-64 bg-gray-900 text-gray-100 flex flex-col">
      <div className="h-16 flex items-center justify-center font-bold text-lg border-b border-gray-700">
        QUẢN LÝ SINH VIÊN
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-800 transition-colors",
                isActive && "bg-gray-800 text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
