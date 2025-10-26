"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface GradeDetail {
  grade_id: number;
  attendance_score: string;
  midterm_score: string;
  assignment_score: string;
  final_score: string;
  total_score: string;
  letter_grade: string;
  status: string;
  enrollment: {
    class_section: {
      academic_year: string;
      semester: string;
      courses: {
        course_name: string;
        course_code: string;
      };
      lecturers: {
        first_name: string;
        last_name: string;
      };
    };
  };
}

export default function GradeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [grade, setGrade] = useState<GradeDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      try {
        const res = await axios.get(`/api/grades/${id}`);
        setGrade(res.data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu chi tiết điểm:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading)
    return <div className="p-6 text-center text-gray-600">Đang tải dữ liệu...</div>;

  if (!grade)
    return (
      <div className="p-6 text-center text-gray-600">
        Không tìm thấy thông tin điểm chi tiết.
      </div>
    );

  const course = grade.enrollment.class_section.courses;
  const lecturer = grade.enrollment.class_section.lecturers;

  return (
    <div className="bg-white">
      {/* Thông tin tổng quan */}
        <div className="p-4 mb-6 bg-gray-50 border rounded-lg shadow-sm space-y-4">
            <div className="flex items-center justify-between">
            <Button
            variant="ghost"
            className="flex items-center gap-2 hover:cursor-pointer"
            onClick={() => router.back()}
            >
            <ArrowLeft className="h-4 w-4" /> Quay lại
            </Button>
            <h1 className="text-2xl font-semibold text-center flex-1">
            ĐIỂM CHI TIẾT
            </h1>
            <div className="w-[120px]" />
        </div>
        
        <div className="grid grid-cols-2 gap-y-2 gap-x-6">
            <p>
            <span className="font-medium">Môn học:</span>{" "}
            {course.course_name} ({course.course_code})
            </p>
            <p>
            <span className="font-medium">Giảng viên:</span>{" "}
            {lecturer.last_name} {lecturer.first_name}
            </p>
            <p>
            <span className="font-medium">Năm học:</span>{" "}
            {grade.enrollment.class_section.academic_year}
            </p>
            <p>
            <span className="font-medium">Học kỳ:</span>{" "}
            {grade.enrollment.class_section.semester}
            </p>
        </div>
    </div>

      {/* Bảng điểm chi tiết */}
      <div className="border rounded-lg overflow-hidden shadow-sm m-6">
        <table className="w-full text-sm border border-gray-300">
          <thead className="bg-gray-300 text-gray-700 border-b border-gray-100">
            <tr>
              <th className="py-2 px-3 text-center border border-gray-100">STT</th>
              <th className="py-2 px-3 text-center border border-gray-100">Tên thành phần</th>
              <th className="py-2 px-3 text-center border border-gray-100">Điểm</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: "Điểm chuyên cần (HS 10)", score: grade.attendance_score },
              { name: "Điểm giữa kỳ (HS 20)", score: grade.midterm_score },
              { name: "Điểm Thảo luận, BTN, TT (HS 20)", score: grade.assignment_score },
              { name: "Điểm cuối kỳ (HS 50)", score: grade.final_score },
            ].map((item, idx) => (
              <tr
                key={idx}
                className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="border px-4 py-2 text-center">{idx + 1}</td>
                <td className="border px-4 py-2">{item.name}</td>
                <td className="border px-4 py-2 text-center">{item.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
