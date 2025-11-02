"use client";

import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";

interface User {
  user_id: number;
  username: string;
  role: "admin" | "lecturer" | "student";
  student_id?: number | null;
  lecturer_id?: number | null;
}

export default function RoleBasedSidebar({ collapsed }: { collapsed: boolean }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userCookie = Cookies.get("user");
    if (userCookie) {
      try {
        const parsedUser: User = JSON.parse(userCookie);
        setUser(parsedUser);
      } catch (error) {
        console.error("❌ Lỗi parse cookie user:", error);
      }
    }
  }, []);

  if (!user) return null; // Có thể thay bằng spinner nếu cần

  return <Sidebar collapsed={collapsed} role={user.role} user={user} />;
}
