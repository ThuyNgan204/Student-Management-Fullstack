// components/auth/RoleGuard.tsx
// "use client";
// import { useAuthStore } from "@/store/useAuthStore";
// import { ROLE } from "@/utils/constants";
// import { redirect } from "next/navigation";

// export default function RoleGuard({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) {
//   const { user } = useAuthStore();
//   if (!user || !allowedRoles.includes(user.role)) {
//     redirect("/auth/login");
//   }
//   return <>{children}</>;
// }
