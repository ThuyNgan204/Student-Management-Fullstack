import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import Providers from "@/providers/QueryProvider";
import MainLayout from "@/components/layout/MainLayout";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Student Management App",
  description: "A student management application with Next.js and React Query.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <MainLayout>{children}</MainLayout>
        </Providers>
      </body>
    </html>
  );
}
