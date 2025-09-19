"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  // Map đường dẫn -> title
  const titles: Record<string, string> = {
    "/": "DASHBOARD",
    "/students": "STUDENTS",
    "/teachers": "TEACHERS",
    "/classes": "CLASSES",
    "/courses": "COURSES",
    "/grades": "GRADES",
    "/majors": "MAJORS",
    "/accounts": "ACCOUNTS",
    "/reports": "REPORTS",
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
