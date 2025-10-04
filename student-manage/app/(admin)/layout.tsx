import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import Providers from "@/providers/QueryProvider";
import MainLayout from "@/components/layout/MainLayout";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Student Management App",
  description: "A student management application with Next.js and React Query.",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
        <Providers>
          <MainLayout>
            {children}
            <Toaster position="top-right" richColors closeButton /> 
          </MainLayout>
        </Providers>
  );
}
