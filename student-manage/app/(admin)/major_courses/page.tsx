"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Major {
  major_id: number;
  major_code: string;
  major_name: string;
}

interface Course {
  course_id: number;
  course_code: string;
  course_name: string;
  credits: number;
}

interface MajorCourse {
  major_id: number;
  course_id: number;
  is_required: boolean;
  courses: Course;
}

interface Student {
  student_id: number;
  first_name: string;
  last_name: string;
  student_code: string;
  majors?: Major;
}

export default function MajorCourses() {
  const [majors, setMajors] = useState<Major[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [majorCourses, setMajorCourses] = useState<MajorCourse[]>([]);
  const [selectedMajor, setSelectedMajor] = useState<number | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [isRequired, setIsRequired] = useState(true);
  const [isAdmin, setIsAdmin] = useState(true);
  const [open, setOpen] = useState(false);
  const [studentInfo, setStudentInfo] = useState<Student | null>(null);

  const searchParams = useSearchParams();
  const studentId = searchParams.get("student");
  const majorCode = searchParams.get("major");
  const router = useRouter();

  // Gọi dữ liệu khi trang load
  useEffect(() => {
    const init = async () => {
      try {
        const majorsData = await fetchMajors();
        await fetchCourses();

        if (studentId) {
          setIsAdmin(false);
          const res = await axios.get(`/api/students/${studentId}`);
          const studentData = res.data;
          setStudentInfo(studentData);

          const majorId = studentData.majors?.major_id;
          if (majorId) {
            setSelectedMajor(majorId);
            await fetchMajorCourses(majorId);
          }
        } else if (majorCode) {
          const foundMajor = majorsData.find((m) => m.major_code === majorCode);
          if (foundMajor) {
            setIsAdmin(false);
            setSelectedMajor(foundMajor.major_id);
            await fetchMajorCourses(foundMajor.major_id);
          } else {
            toast.error("Không tìm thấy chuyên ngành trong hệ thống.");
          }
        } else {
          // 🟢 Trường hợp không có studentId và majorCode → chế độ ADMIN
          setIsAdmin(true);
          setStudentInfo(null);
          setSelectedMajor(null);
        }
      } catch {
        toast.error("Lỗi khi tải dữ liệu ban đầu.");
      }
    };

    init();
  }, [studentId, majorCode]);

  // Khi chọn lại ngành thì tải lại học phần
  useEffect(() => {
    if (selectedMajor) fetchMajorCourses(selectedMajor);
  }, [selectedMajor]);

  const fetchMajors = async () => {
    try {
      const res = await axios.get("/api/majors", { params: { page: 1, page_size: 100 } });
      const data = res.data.items || res.data;
      setMajors(data);
      return data;
    } catch {
      toast.error("Không thể tải danh sách ngành.");
      return [];
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await axios.get("/api/courses", { params: { page: 1, page_size: 100 } });
      setCourses(res.data.items || res.data);
    } catch {
      toast.error("Không thể tải danh sách học phần.");
    }
  };

  const fetchMajorCourses = async (majorId: number) => {
    try {
      const res = await axios.get(`/api/major_courses?major_id=${majorId}`);
      setMajorCourses(res.data || []);
    } catch {
      toast.error("Không thể tải học phần của ngành.");
    }
  };

  const handleAddCourse = async () => {
    if (!selectedMajor || !selectedCourse) {
      toast.error("Vui lòng chọn ngành và học phần.");
      return;
    }
    try {
      const res = await axios.post(`/api/major_courses`, {
        major_id: selectedMajor,
        course_id: selectedCourse,
        is_required: isRequired,
      });
      setMajorCourses((prev) => [...prev, res.data]);
      setSelectedCourse(null);
      setOpen(false);
      toast.success("Thêm học phần thành công!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Không thể thêm học phần.");
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (!selectedMajor) return;
    try {
      await axios.delete(
        `/api/major_courses?major_id=${selectedMajor}&course_id=${courseId}`
      );
      setMajorCourses((prev) => prev.filter((mc) => mc.course_id !== courseId));
      toast.success("Đã xóa học phần thành công.");
    } catch {
      toast.error("Lỗi khi xóa học phần.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <div className="p-4 mb-6 bg-gray-50 border rounded-lg shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          {/* Nút quay lại chỉ hiện với student */}
          {!isAdmin && (
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-gray-700 hover:text-primary transition"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </Button>
          )}

          {/* Tiêu đề */}
          <h2 className="text-xl font-semibold text-center flex-1">
            KẾ HOẠCH ĐÀO TẠO TỔNG THỂ
          </h2>

          {/* Nút thêm học phần chỉ hiện với admin */}
          {isAdmin && selectedMajor ? (
            <Button onClick={() => setOpen(true)}>
              <Plus className="w-4 h-4 mr-1" /> Thêm học phần
            </Button>
          ) : (
            // Giữ chỗ để tiêu đề luôn căn giữa
            <div className="w-[120px]" />
          )}
        </div>

        {/* Thông tin sinh viên hoặc chọn ngành */}
        {isAdmin ? (
          <div className="flex items-center gap-2">
            <Label className="block">Chọn chuyên ngành</Label>
            <Select
              onValueChange={(v) => setSelectedMajor(Number(v))}
              value={selectedMajor?.toString() || ""}
            >
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Chọn ngành" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {majors.map((m) => (
                  <SelectItem key={m.major_id} value={m.major_id.toString()}>
                    {m.major_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            {/* Họ tên + MSSV */}
            <div className="flex items-center gap-2">
              <p className="text-blue-500">
                {studentInfo
                  ? `${studentInfo.last_name} ${studentInfo.first_name}`
                  : "Đang tải..."}
              </p>
              <p className="text-blue-500">
                [Mã số: {studentInfo?.student_code || "Đang tải..."}]
              </p>
            </div>

            {/* Chuyên ngành */}
            <div className="flex items-center gap-2">
              <Label className="whitespace-nowrap">Chuyên ngành:</Label>
              <p >
                {selectedMajor
                  ? majors.find((m) => m.major_id === selectedMajor)?.major_name
                  : "Đang tải..."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Danh sách học phần */}
      {selectedMajor && (
        <div>
          {majorCourses.length === 0 ? (
            <p className="text-gray-500 italic">
              Chưa có học phần nào trong ngành này.
            </p>
          ) : (
            <div className="flex-1 overflow-x-auto px-6 py-4">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="py-2 px-3 text-left">STT</th>
                    <th className="py-2 px-3 text-left">Mã học phần</th>
                    <th className="py-2 px-3 text-left">Tên học phần</th>
                    <th className="py-2 px-3 text-center">Tín chỉ</th>
                    <th className="py-2 px-3 text-center">Loại học phần</th>
                    {isAdmin && (
                      <th className="py-2 px-3 text-center">Thao tác</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {majorCourses.map((mc, index) => (
                    <tr
                      key={mc.course_id}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="py-2 px-3">{index + 1}</td>
                      <td className="py-2 px-3">{mc.courses.course_code}</td>
                      <td className="py-2 px-3">{mc.courses.course_name}</td>
                      <td className="py-2 px-3 text-center">
                        {mc.courses.credits}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {mc.is_required ? "Bắt buộc" : "Tự chọn"}
                      </td>
                      {isAdmin && (
                        <td className="py-2 px-3 text-center">
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => handleDeleteCourse(mc.course_id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal thêm học phần */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Thêm học phần vào chương trình đào tạo</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Chọn học phần</Label>
              <Select
                onValueChange={(v) => setSelectedCourse(Number(v))}
                value={selectedCourse?.toString() || ""}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Chọn học phần" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {courses.map((c) => (
                    <SelectItem
                      key={c.course_id}
                      value={c.course_id.toString()}
                    >
                      {c.course_code} — {c.course_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Loại học phần</Label>
              <Select
                onValueChange={(v) => setIsRequired(v === "true")}
                value={isRequired.toString()}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Chọn loại học phần" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Bắt buộc</SelectItem>
                  <SelectItem value="false">Tự chọn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleAddCourse}>Thêm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
