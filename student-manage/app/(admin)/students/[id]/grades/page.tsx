"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import axios from "axios";
import Cookies from "js-cookie";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface Grade {
  grade_id: number;
  total_score: string;
  letter_grade: string;
  status: string;
  enrollment: {
    enrollment_id: number;
    student_id: number;
    students: {
      student_id: number;
      student_code: string;
      first_name: string;
      last_name: string;
      cohort?: number; // ✅ thêm cohort (niên khóa)
      majors?: { major_name: string };
    };
    class_section: {
      academic_year: string;
      semester: string;
      courses: {
        course_code: string;
        course_name: string;
        credits: number;
      };
    };
  };
}

export default function StudentGradesPage() {
  const { id: studentId } = useParams();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [student, setStudent] = useState<any>(null);
  const [grouped, setGrouped] = useState<Record<string, Grade[]>>({});
  const [avgScore, setAvgScore] = useState<number>(0);
  const [totalCredits, setTotalCredits] = useState<number>(0);
  const [selectedYear, setSelectedYear] = useState<string>("Tất cả"); // ✅ năm học được chọn để filter
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  const getRank = (avg: number) => {
    if (avg >= 8) return "Giỏi";
    if (avg >= 7) return "Khá";
    if (avg >= 5) return "Trung bình";
    return "Yếu";
  };

  useEffect(() => {
    const userCookie = Cookies.get("user");
    if (userCookie) {
      try {
        const parsed = JSON.parse(userCookie);
        setUserRole(parsed.role);
      } catch (error) {
        console.error("Lỗi parse cookie user:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (!studentId) return;

    axios
      .get(`/api/grades?student_id=${studentId}`)
      .then((res) => {
        const data = res.data.items || [];

        const merged = data.map((g: any) => {
          let semester = g.enrollment.class_section.semester;
          if (semester.toLowerCase().includes("h")) semester = "2";
          return {
            ...g,
            enrollment: {
              ...g.enrollment,
              class_section: {
                ...g.enrollment.class_section,
                semester,
              },
            },
          };
        });

        const sorted = [...merged].sort((a, b) => {
          const yearA = parseInt(a.enrollment.class_section.academic_year);
          const yearB = parseInt(b.enrollment.class_section.academic_year);
          const semA = parseInt(a.enrollment.class_section.semester);
          const semB = parseInt(b.enrollment.class_section.semester);
          if (yearA !== yearB) return yearA - yearB;
          return semA - semB;
        });

        setGrades(sorted);
        if (sorted.length > 0) setStudent(sorted[0].enrollment.students);

        const groupedBySemester = sorted.reduce((acc: any, g: any) => {
          const key = `Học kỳ ${g.enrollment.class_section.semester}/${g.enrollment.class_section.academic_year}`;
          if (!acc[key]) acc[key] = [];
          acc[key].push(g);
          return acc;
        }, {});
        setGrouped(groupedBySemester);

        let totalWeighted = 0;
        let totalCredits = 0;
        sorted.forEach((g: any) => {
          const credits = g.enrollment.class_section.courses.credits;
          const score = parseFloat(g.total_score);
          if (!isNaN(score)) {
            totalWeighted += score * credits;
            totalCredits += credits;
          }
        });
        if (totalCredits > 0) {
          setAvgScore(totalWeighted / totalCredits);
          setTotalCredits(totalCredits);
        }
      })
      .catch((err) => console.error("Lỗi lấy điểm:", err));
  }, [studentId]);

  // ✅ Sinh danh sách các năm học dựa trên cohort và năm hiện tại
  const yearOptions = useMemo(() => {
    const cohortNum = Number(student?.cohort);
    if (!cohortNum || isNaN(cohortNum)) return [];

    const now = new Date().getFullYear();
    const years = [];

    for (let y = cohortNum; y <= now; y++) {
      years.push(`${y}-${y + 1}`);
    }
    return years;
  }, [student]);

  // ✅ Lọc dữ liệu theo năm học được chọn
  const filteredGrouped = useMemo(() => {
    if (selectedYear === "Tất cả") return grouped;
    const filtered: Record<string, Grade[]> = {};
    for (const [semester, gradeList] of Object.entries(grouped)) {
      if (semester.includes(selectedYear)) filtered[semester] = gradeList;
    }
    return filtered;
  }, [grouped, selectedYear]);

  const calcSemesterAverage = (grades: Grade[]) => {
    let totalWeighted = 0;
    let totalCredits = 0;
    grades.forEach((g) => {
      const credits = g.enrollment.class_section.courses.credits;
      const score = parseFloat(g.total_score);
      if (!isNaN(score)) {
        totalWeighted += score * credits;
        totalCredits += credits;
      }
    });
    return totalCredits > 0 ? (totalWeighted / totalCredits).toFixed(2) : "0.00";
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      {/* Header */}
      <div className="p-4 mb-6 bg-gray-50 border rounded-lg shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-gray-700 hover:text-primary transition"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>

          <h2 className="text-xl font-semibold text-center flex-1">
            KẾT QUẢ HỌC TẬP TỔNG HỢP
          </h2>

          <div className="w-[120px]" />
        </div>

        {student && (
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <p className="text-blue-500">
                {student.last_name} {student.first_name}
              </p>
              <p className="text-blue-500">[Mã số: {student.student_code}]</p>
            </div>

            <div className="flex items-center gap-2">
              <Label className="whitespace-nowrap text-blue-500">Chuyên ngành:</Label>
              <p className="text-blue-500">{student.majors?.major_name || "Chưa cập nhật"}</p>
            </div>
          </div>
        )}

        {grades.length > 0 && (
          <div className="text-red-600 font-medium">
            Trung bình toàn khóa:{" "}
            <span className="font-bold">{avgScore.toFixed(2)}</span>; STC tích lũy:{" "}
            <span className="font-bold">{totalCredits}tc</span>; Xếp loại học lực:{" "}
            <span className="font-bold">{getRank(avgScore)}</span>
          </div>
        )}

        {/* ✅ Khu vực điều khiển filter + in bảng điểm */}
        <div className="flex items-center gap-4 pt-2">
          {/* Filter năm học */}
          <select
            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="Tất cả">Tất cả các năm</option>
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          {/* Nút in bảng điểm */}
          {userRole !== "student" && (
            <Button
              variant="outline"
              className="border-gray-400 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                const yearParam = selectedYear === "Tất cả" ? "" : `&academic_year=${selectedYear}`;
                const cohortParam = student?.cohort ? `&cohort=${student.cohort}` : "";
                window.open(`/api/grades/print-report?student_id=${studentId}${yearParam}${cohortParam}`, "_blank");
              }}
            >
              In bảng điểm
            </Button>
          )}
        </div>
      </div>

      {/* Section chứa các học kỳ */}
      <section className="px-6 pb-10 space-y-6">
        {Object.keys(filteredGrouped).length === 0 ? (
          <p className="text-gray-500 italic text-center">Không có dữ liệu điểm.</p>
        ) : (
          Object.entries(filteredGrouped).map(([semester, gradeList]) => {
            const semesterAvg = calcSemesterAverage(gradeList);
            const passedCredits = gradeList.reduce((sum, g) => {
              const c = g.enrollment.class_section.courses.credits;
              return g.status === "Đạt" ? sum + c : sum;
            }, 0);
            const failedCredits = gradeList.reduce((sum, g) => {
              const c = g.enrollment.class_section.courses.credits;
              return g.status !== "Đạt" ? sum + c : sum;
            }, 0);
            const totalSemesterCredits = passedCredits + failedCredits;

            return (
              <Card key={semester} className="p-4 border shadow-sm">
                <h3 className="text-lg font-semibold text-blue-700 border-b pb-2 mb-1">
                  {semester}
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-gray-300">
                    <thead className="bg-gray-300 text-gray-700 border-b border-gray-100">
                      <tr>
                        <th className="py-2 px-3 text-left border border-gray-100">STT</th>
                        <th className="py-2 px-3 text-left border border-gray-100">Mã học phần</th>
                        <th className="py-2 px-3 text-left border border-gray-100">Tên học phần</th>
                        <th className="py-2 px-3 text-center border border-gray-100">Tín chỉ</th>
                        <th className="py-2 px-3 text-center border border-gray-100">Tổng điểm</th>
                        <th className="py-2 px-3 text-center border border-gray-100">Kết quả</th>
                        <th className="py-2 px-3 text-center border border-gray-100">Chi tiết</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gradeList.map((g, idx) => (
                        <tr key={g.grade_id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="py-2 px-3 border border-gray-100">{idx + 1}</td>
                          <td className="py-2 px-3 border border-gray-100">
                            {g.enrollment.class_section.courses.course_code}
                          </td>
                          <td className="py-2 px-3 border border-gray-100">
                            {g.enrollment.class_section.courses.course_name}
                          </td>
                          <td className="py-2 px-3 text-center border border-gray-100">
                            {g.enrollment.class_section.courses.credits}
                          </td>
                          <td className="py-2 px-3 text-center border border-gray-100">
                            {g.total_score}
                          </td>
                          <td
                            className={`py-2 px-3 text-center font-semibold border border-gray-100 ${
                              g.status === "Đạt" ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {g.status}
                          </td>
                          <td className="py-2 px-3 text-center border border-gray-100">
                            <Button
                              variant="link"
                              className="text-blue-600 underline hover:cursor-pointer"
                              onClick={() => router.push(`/grades/${g.grade_id}`)}
                            >
                              Chi tiết
                            </Button>
                          </td>
                        </tr>
                      ))}

                      <tr className="font-medium text-gray-700">
                        <td colSpan={3} className="border border-gray-100 p-2 text-right">
                          STC Đậu ({passedCredits}) + STC Rớt ({failedCredits})
                        </td>
                        <td className="border border-gray-100 p-2 text-center font-bold">
                          {totalSemesterCredits}
                        </td>
                        <td colSpan={3} className="border border-gray-100 p-2 text-left">
                          Điểm Trung Bình:{" "}
                          <span className="font-bold text-blue-700">{semesterAvg}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            );
          })
        )}
      </section>
    </div>
  );
}
