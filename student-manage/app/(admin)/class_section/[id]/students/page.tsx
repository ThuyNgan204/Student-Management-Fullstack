"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/date";
import { ArrowLeft } from "lucide-react";

interface Student {
  student_id: number;
  student_code: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  cohort?: string;
  status?: string;
  dob?: string;
  class_code?: string;
}

interface ClassSectionInfo {
  section_code: string;
  academic_year: string;
  semester: string;
  course: {
    course_code: string;
    course_name: string;
    credits: number;
  };
}

export default function ClassSectionStudentsPage() {
  const params = useParams();
  const router = useRouter();
  const classSectionId = Number(params.id);

  const [students, setStudents] = useState<Student[]>([]);
  const [classSection, setClassSection] = useState<ClassSectionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`/api/class_section/${classSectionId}/students`);

        const studentsData = res.data.map((enrollment: any) => ({
          student_id: enrollment.student.student_id,
          student_code: enrollment.student.student_code,
          first_name: enrollment.student.first_name,
          last_name: enrollment.student.last_name,
          email: enrollment.student.email,
          phone: enrollment.student.phone,
          avatar: enrollment.student.avatar,
          cohort: enrollment.student.cohort,
          status: enrollment.status,
          dob: enrollment.student.dob,
          class_code: enrollment.student.class_code,
        }));

        setStudents(studentsData);
        setClassSection(res.data[0]?.class_section || null); // ✅ lấy thông tin lớp học phần
      } catch (err) {
        console.error(err);
        toast.error("Không tải được danh sách sinh viên");
      } finally {
        setIsLoading(false);
      }
    };

    if (!isNaN(classSectionId)) {
      fetchStudents();
    }
  }, [classSectionId]);

  return (
    <div className="min-h-screen bg-white">
      <div className="p-4 ml-0 bg-gray-50 border rounded-lg shadow-sm space-y-3">
        {/* Hàng 1: Nút + Tiêu đề */}
        <div className="flex items-center gap-3">
            <Button
                variant="ghost"
                className="flex items-center gap-2 text-gray-700 hover:text-primary transition"
                onClick={() => router.back()}
            >
                <ArrowLeft className="w-4 h-4" />
                Quay lại
          </Button>

            <h2 className="text-lg font-semibold text-center flex-1">
            DANH SÁCH SINH VIÊN LỚP HỌC PHẦN
            </h2>

            <Button
            variant="ghost"
            className="bg-gray-200 hover:bg-gray-300 transition"
            onClick={() =>
                window.open(`/api/class_section/${classSectionId}/students/print`, "_blank")
            }
            >
            🖨 In danh sách
            </Button>
        </div>

        {/* Hàng 2: Thông tin lớp */}
        {classSection && (
            <div className="flex flex-col gap-2 text-sm ">
            <p><strong>Lớp học phần:</strong> {classSection.section_code}</p>
            <p>
                <strong>Môn học:</strong> {classSection.course.course_name} 
                ({classSection.course.course_code})
            </p>
            </div>
        )}
        </div>

      {isLoading ? (
        <p>Đang tải danh sách sinh viên...</p>
      ) : students.length === 0 ? (
        <p className="text-gray-500 italic text-center">Không có sinh viên nào</p>
      ) : (
        <div className="overflow-x-auto p-6 mt-4">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="py-2 px-3 border border-gray-300">STT</th>
                <th className="py-2 px-3 border border-gray-300">Họ và tên</th>
                <th className="py-2 px-3 border border-gray-300">Mã sinh viên</th>
                <th className="py-2 px-3 border border-gray-300">Ngày sinh</th>
                <th className="py-2 px-3 border border-gray-300">Email</th>
                <th className="py-2 px-3 border border-gray-300">Số điện thoại</th>
                <th className="py-2 px-3 border border-gray-300">Lớp sinh hoạt</th>
                <th className="py-2 px-3 border border-gray-300">Khóa</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, idx) => (
                <tr key={s.student_id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="py-2 px-3 border border-gray-300 text-center">{idx + 1}</td>
                  <td className="py-2 px-3 border border-gray-300">
                    {s.last_name} {s.first_name}
                  </td>
                  <td className="py-2 px-3 border border-gray-300 text-center">{s.student_code}</td>
                  <td className="py-2 px-3 border border-gray-300 text-center">
                    {formatDate(s.dob || "")}
                  </td>
                  <td className="py-2 px-3 border border-gray-300">{s.email}</td>
                  <td className="py-2 px-3 border border-gray-300 text-center">{s.phone}</td>
                  <td className="py-2 px-3 border border-gray-300 text-center">{s.class_code}</td>
                  <td className="py-2 px-3 border border-gray-300 text-center">{s.cohort}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
