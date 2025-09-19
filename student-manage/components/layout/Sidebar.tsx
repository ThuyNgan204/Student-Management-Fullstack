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
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Students", href: "/students", icon: Users },
  { name: "Teachers", href: "/teachers", icon: UserCog },
  { name: "Classes", href: "/classes", icon: ClipboardList },
  { name: "Courses", href: "/courses", icon: BookOpen },
  { name: "Majors", href: "/majors", icon: GraduationCap },
  { name: "Grades", href: "/grades", icon: FileText },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Accounts", href: "/accounts", icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-full w-64 bg-gray-900 text-gray-100 flex flex-col">
      <div className="h-16 flex items-center justify-center font-bold text-lg border-b border-gray-700">
        Student Admin
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
