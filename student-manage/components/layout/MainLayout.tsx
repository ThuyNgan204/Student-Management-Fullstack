"use client";

import { useState } from "react";
import Header from "./Header";
import RoleBasedSidebar from "./RoleBasedSidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <RoleBasedSidebar collapsed={collapsed} /> {/* ✅ dùng state collapsed */}
      <div className="flex flex-col flex-1 min-w-0">
        <Header collapsed={collapsed} setCollapsed={setCollapsed} />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
