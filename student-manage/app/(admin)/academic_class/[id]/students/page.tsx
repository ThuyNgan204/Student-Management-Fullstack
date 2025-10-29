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

interface AcademicClassInfo {
  class_code: string;
  class_name: string;
  cohort: string;
  lecturer: {
    last_name: string;
    first_name: string;
  } | null;
  majors: {
    major_name: string;
  } | null;
  departments: {
    department_name: string;
  } | null;
}

export default function ClassAcademicStudentsPage() {
  const params = useParams();
  const router = useRouter();
  const academicClassId = Number(params.id);

  const [students, setStudents] = useState<Student[]>([]);
  const [classInfo, setClassInfo] = useState<AcademicClassInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`/api/academic_class/${academicClassId}/students`);

        const studentsData = res.data.students.map((s: any) => ({
          student_id: s.student_id,
          student_code: s.student_code,
          first_name: s.first_name,
          last_name: s.last_name,
          email: s.email,
          phone: s.phone,
          avatar: s.avatar,
          cohort: s.cohort,
          status: s.status,
          dob: s.dob,
          class_code: s.class_code,
        }));

        setStudents(studentsData);
        setClassInfo(res.data.classInfo);
      } catch (err) {
        console.error(err);
        toast.error("Không tải được danh sách sinh viên");
      } finally {
        setIsLoading(false);
      }
    };

    if (!isNaN(academicClassId)) {
      fetchStudents();
    }
  }, [academicClassId]);

  return (
    <div className="min-h-screen bg-white">
      <div className="p-4 ml-0 bg-gray-50 border rounded-lg shadow-sm space-y-3">
        {/* Back + Title + Print */}
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
            DANH SÁCH SINH VIÊN LỚP SINH HOẠT
          </h2>

          <Button
            variant="ghost"
            className="bg-gray-200 hover:bg-gray-300 transition"
            onClick={() =>
              window.open(`/api/academic_class/${academicClassId}/students/print`, "_blank")
            }
          >
            🖨 In danh sách
          </Button>
        </div>

        {/* Academic Class Info */}
        {classInfo && (
          <div className="grid grid-cols-2 gap-2 text-sm mt-2">
            <p>
                <strong>Lớp sinh hoạt:</strong> {classInfo.class_code} - {classInfo.class_name}
            </p>
            <p>
                <strong>Giảng viên chủ nhiệm:</strong>{" "}
                {classInfo.lecturer ? `${classInfo.lecturer.last_name} ${classInfo.lecturer.first_name}` : "—"}
            </p>
            <p>
                <strong>Khoa:</strong> {classInfo.departments?.department_name || "—"}
            </p>
            <p>
                <strong>Ngành:</strong> {classInfo.majors?.major_name || "—"}
            </p>
            </div>
        )}
      </div>

      {isLoading ? (
        <p>Đang tải danh sách sinh viên...</p>
      ) : students.length === 0 ? (
        <p className="text-gray-500 italic text-center mt-4">Không có sinh viên nào</p>
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
                <th className="py-2 px-3 border border-gray-300">SĐT</th>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
