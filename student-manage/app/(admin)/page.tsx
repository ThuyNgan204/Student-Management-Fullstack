"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { toast } from "sonner";

interface StatItem {
  label: string;
  count: number;
  percent: string;
}

const COLORS = [
  "#6366F1", // Indigo
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#3B82F6", // Blue
  "#EC4899", // Pink
  "#8B5CF6", // Violet
  "#EAB308", // Yellow
];

export default function DashboardPage() {
  const [stats, setStats] = useState<StatItem[]>([]);
  const [studentByDept, setStudentByDept] = useState<any[]>([]);
  const [studentByMajor, setStudentByMajor] = useState<any[]>([]);
  const [classByMajor, setClassByMajor] = useState<any[]>([]);
  const [sectionByMajor, setSectionByMajor] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleBackup = async () => {
    try {
      const res = await fetch("/api/backup");

      if (res.status === 200) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `backup_${new Date().toISOString().replace(/[:.]/g, "-")}.sql`;
        link.click();
        window.URL.revokeObjectURL(url);

        toast.success("Sao lưu thành công");
      } else {
        toast.error("Sao lưu thất bại");
      }
    } catch (error) {
      console.error(error);
      toast.error("Sao lưu thất bại");
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        // 📊 Lấy thống kê tổng quan
        const resStats = await fetch("/api/dashboard");
        if (resStats.ok) {
          const data = await resStats.json();
          setStats(data.stats || []);
        }

        // 🧩 Sinh viên theo khoa + ngành
        const resStudents = await fetch("/api/students?page_size=500");
        const dataStudents = await resStudents.json();

        // --- Theo khoa ---
        const groupedDept: Record<string, number> = {};
        dataStudents.items?.forEach((s: any) => {
          const deptName = s.majors?.departments?.department_name || "Khác";
          groupedDept[deptName] = (groupedDept[deptName] || 0) + 1;
        });
        const studentDeptData = Object.entries(groupedDept)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);
        setStudentByDept(studentDeptData);

        // --- Theo ngành ---
        const groupedMajor: Record<string, number> = {};
        dataStudents.items?.forEach((s: any) => {
          const majorName = s.majors?.major_name || "Khác";
          groupedMajor[majorName] = (groupedMajor[majorName] || 0) + 1;
        });
        const studentMajorData = Object.entries(groupedMajor)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);
        setStudentByMajor(studentMajorData);

        // 🧩 Lớp sinh hoạt theo ngành
        const resClasses = await fetch("/api/academic_class?page_size=500");
        const dataClasses = await resClasses.json();
        const groupedMajor2: Record<string, number> = {};
        dataClasses.items?.forEach((c: any) => {
          const majorName = c.majors?.major_name || "Khác";
          groupedMajor2[majorName] = (groupedMajor2[majorName] || 0) + 1;
        });
        const classByMajorData = Object.entries(groupedMajor2)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);
        setClassByMajor(classByMajorData);

        // 🧩 Lớp học phần theo khoa
        const resSections = await fetch("/api/class_section?page_size=500");
        const dataSections = await resSections.json();
        const groupedMajor3: Record<string, number> = {};
        dataSections.items?.forEach((sec: any) => {
          const majorName = sec.courses?.departments?.department_name || "Khác";
          groupedMajor3[majorName] = (groupedMajor3[majorName] || 0) + 1;
        });
        const sectionByMajorData = Object.entries(groupedMajor3)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);
        setSectionByMajor(sectionByMajorData);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading)
    return (
      <p className="text-center text-muted-foreground mt-10">
        Loading dashboard...
      </p>
    );

  const labelMapping: any = {
    Students: "Tổng số sinh viên",
    Lecturers: "Tổng số giảng viên",
    Departments: "Tổng số khoa",
    Majors: "Tổng số chuyên ngành",
    Classes: "Tổng số lớp sinh hoạt",
    "Class Sections": "Tổng số lớp học phần"
  };

  return (
    <div className="p-6 space-y-10">
      {/* 🧮 Cards tổng quan */}
      {stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((item) => (
            <Card
              key={item.label}
              className="shadow-sm hover:shadow-md transition"
            >
              <CardHeader>
                <CardTitle className="text-lg font-medium">
                  {labelMapping[item.label] ?? item.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{item.count}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Button variant="ghost" className="bg-gray-200 hover:bg-gray-300 transition" onClick={handleBackup}>Sao lưu toàn bộ dữ liệu hệ thống</Button>
      
      {/* 🧩 Sinh viên theo ngành */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>TỶ LỆ SINH VIÊN THEO TỪNG CHUYÊN NGÀNH</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex justify-center items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip />
              <Legend layout="vertical" align="right" verticalAlign="middle" />
              <Pie
                data={studentByMajor}
                dataKey="count"
                nameKey="name"
                cx="40%"
                cy="50%"
                outerRadius={120}
                labelLine={false}
                label={({ name, count }) => `${name}: ${count}`}
              >
                {studentByMajor.map((_, i) => (
                  <Cell
                    key={i}
                    fill={COLORS[i % COLORS.length]}
                    stroke="#1E1E2F"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 🧩 Sinh viên theo khoa */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>SỐ LƯỢNG SINH VIÊN THEO KHOA</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={studentByDept}
              margin={{ top: 20, right: 20, left: 0, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-30}
                textAnchor="end"
                interval={0}
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="count"
                fill="#4F46E5"
                name="Số sinh viên"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 🧩 Hàng: Lớp sinh hoạt & lớp học phần */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lớp sinh hoạt */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>SỐ LỚP SINH HOẠT THEO NGÀNH</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={classByMajor}
                margin={{ top: 20, right: 20, left: 0, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                  height={80}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="#10B981"
                  name="Số lớp sinh hoạt"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lớp học phần */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>SỐ LỚP HỌC PHẦN THEO KHOA</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sectionByMajor}
                margin={{ top: 20, right: 20, left: 0, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                  height={80}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="#F59E0B"
                  name="Số lớp học phần"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
