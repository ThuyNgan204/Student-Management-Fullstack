"use client";

import { cn } from "@/lib/utils";
import {
  BookOpen,
  Building2,
  ClipboardList,
  FileText,
  GraduationCap,
  Layers,
  LayoutDashboard,
  UserCog,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { name: "Tổng quan", href: "/", icon: LayoutDashboard },
  { name: "Quản lý sinh viên", href: "/students", icon: Users },
  { name: "Quản lý giảng viên", href: "/lecturers", icon: UserCog },
  { name: "Quản lý khoa", href: "/departments", icon: Building2 },
  { name: "Quản lý chuyên ngành", href: "/majors", icon: GraduationCap },
  { name: "Quản lý lớp sinh hoạt", href: "/academic_class", icon: ClipboardList },
  { name: "Quản lý học phần", href: "/courses", icon: BookOpen },
  { name: "Quản lý đăng ký", href: "/enrollment", icon: UserPlus },
  { name: "Quản lý lớp học phần", href: "/class_section", icon: Layers },
  { name: "Quản lý điểm", href: "/grades", icon: FileText },
  { name: "Chương trình đào tạo", href: "/major_courses", icon: FileText },
  { name: "Quản lý tài khoản", href: "/accounts", icon: Users },
];

export default function Sidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "h-full bg-gray-900 text-gray-100 flex flex-col transition-all duration-300",
        collapsed ? "w-[70px]" : "w-64"
      )}
    >
      <div className="h-16 flex items-center justify-center font-bold text-lg border-b border-gray-700">
        {!collapsed && "QUẢN LÝ SINH VIÊN"}
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
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-800 transition-all",
                isActive && "bg-gray-800 text-white",
                collapsed && "justify-center"
              )}
            >
              <Icon className="size-4" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
