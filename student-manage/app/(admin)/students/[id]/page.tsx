"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/utils/date";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import {
  ArrowLeft,
  BookOpen,
  Loader2,
  Pencil,
  School,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Student {
  student_id: number;
  student_code: string;
  first_name: string;
  last_name: string;
  gender: string;
  dob: string;
  address: string;
  phone: string;
  email: string;
  avatar: string | null;
  cohort: string;
  status: string;
  academic_class: {
    class_name: string;
    class_code: string;
    lecturers: {
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
    };
    majors: {
      major_name: string;
    };
  };
  majors: {
    major_name: string;
    major_code: string;
    departments: {
      department_name: string;
    };
  };
}

export default function StudentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id;

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const {
    data: student,
    isLoading,
    isError,
    refetch,
  } = useQuery<Student>({
    queryKey: ["student", studentId],
    queryFn: async () => {
      const res = await axios.get(`/api/students/${studentId}`);
      return res.data;
    },
    enabled: !!studentId,
  });

  useEffect(() => {
    if (student) {
      setStudentData(student);
      setFormData(student);
    }
  }, [student]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const newErrors: any = {};

    if (!formData.last_name) newErrors.last_name = "Họ không được để trống";
    if (!formData.first_name) newErrors.first_name = "Tên không được để trống";
    if (!formData.gender) newErrors.gender = "Giới tính không được để trống";
    if (!formData.email) newErrors.email = "Email không được để trống";
    if (!formData.phone) newErrors.phone = "Số điện thoại không được để trống";
    if (!formData.address) newErrors.address = "Địa chỉ không được để trống";

    setErrors(newErrors);

    // Nếu có lỗi thì không gọi API
    if (Object.keys(newErrors).length > 0) {
      toast.error("Vui lòng kiểm tra lại thông tin!");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.put(`/api/students/${studentId}`, formData);
      toast.success("Cập nhật thông tin thành công!");
      setStudentData(res.data);
      setIsEditOpen(false);
      refetch();
    } catch (error) {
      console.error(error);
      toast.error("Cập nhật thất bại!");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="w-6 h-6 mr-2 animate-spin" />
        <span>Đang tải dữ liệu...</span>
      </div>
    );

  if (isError || !studentData)
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <p className="text-red-500 text-lg mb-4">
          Không thể tải thông tin sinh viên.
        </p>
        {userRole === "admin" && (
          <Button onClick={() => router.push("/students")}>Quay lại</Button>
        )}
      </div>
    );

  const fullName = `${studentData.last_name} ${studentData.first_name}`;

  return (
    <>
      {/* ✅ Chỉ admin mới thấy nút quay lại */}
      {userRole === "admin" && (
        <div className="w-full max-w-md mb-4">
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-gray-700 hover:text-primary transition"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ==== LEFT SIDE ==== */}
        <Card className="col-span-1 flex flex-col items-center p-6">
          <div className="relative w-40 h-40 rounded-full overflow-hidden border shadow">
            <img
              src={
                studentData.avatar ||
                "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              }
              alt={fullName}
              className="w-40 h-40 rounded-full object-cover border shadow"
            />
          </div>

          <h2 className="mt-4 text-xl font-semibold">{fullName}</h2>
          <p className="text-gray-500 text-sm">{studentData.student_code}</p>

          {/* ACTION BUTTONS */}
          <div className="mt-6 flex flex-col w-full gap-3">
            <Button
              className="w-full flex items-center justify-center gap-2"
              onClick={() => setIsEditOpen(true)}
            >
              <Pencil size={16} /> Cập nhật thông tin
            </Button>

            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => router.push(`/students/${studentId}/grades`)}
            >
              <School size={16} /> Xem điểm
            </Button>

            <Button
              variant="secondary"
              className="w-full flex items-center justify-center gap-2"
              onClick={() =>
                router.push(`/major_courses?student=${studentId}&role=student&major=${studentData.majors?.major_code}`)
              }
            >
              <BookOpen size={16} /> Chương trình đào tạo
            </Button>
          </div>
        </Card>

        {/* ==== RIGHT SIDE ==== */}
        <div className="col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* --- Thông tin sinh viên --- */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin sinh viên</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <InfoRow label="Họ và tên" value={fullName} />
              <InfoRow label="Mã sinh viên" value={studentData.student_code} />
              <InfoRow label="Giới tính" value={studentData.gender} />
              <InfoRow label="Ngày sinh" value={formatDate(studentData.dob)} />
              <InfoRow label="Email" value={studentData.email} />
              <InfoRow label="Số điện thoại" value={studentData.phone} />
              <InfoRow label="Địa chỉ" value={studentData.address} />
              <InfoRow label="Năm nhập học" value={studentData.cohort} />
              <InfoRow label="Trạng thái" value={studentData.status} />
            </CardContent>
          </Card>

          {/* --- Thông tin khóa học --- */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin khóa học</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <InfoRow label="Chuyên ngành" value={studentData.majors?.major_name || "—"} />
              <InfoRow
                label="Khoa quản lý"
                value={studentData.majors?.departments?.department_name || "—"}
              />
              <InfoRow
                label="Lớp sinh hoạt"
                value={studentData.academic_class?.class_name || "—"}
              />
              <InfoRow
                label="Cố vấn học tập"
                value={
                  studentData.academic_class?.lecturers
                    ? `${studentData.academic_class.lecturers.last_name} ${studentData.academic_class.lecturers.first_name}`
                    : "—"
                }
              />
              <InfoRow
                label="Email giảng viên"
                value={studentData.academic_class?.lecturers?.email || "—"}
              />
              <InfoRow
                label="Số điện thoại giảng viên"
                value={studentData.academic_class?.lecturers?.phone || "—"}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* === Edit Modal === */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin sinh viên</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex justify-center">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border">
                <img
                  src={
                    formData.avatar ||
                    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                  }
                  alt="Avatar"
                  className="w-24 h-24 object-cover"
                />
              </div>
            </div>

            <div>
              <Label className="mb-2">Ảnh đại điện (URL)</Label>
              <Input
                name="avatar"
                value={formData.avatar || ""}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-2">Họ</Label>
                <Input
                  name="last_name"
                  value={formData.last_name || ""}
                  onChange={handleChange}
                />
                {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>}
              </div>
              <div>
                <Label className="mb-2">Tên</Label>
                <Input
                  name="first_name"
                  value={formData.first_name || ""}
                  onChange={handleChange}
                />
                {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>}
              </div>
            </div>

            <div>
              <Label className="mb-2">Giới tính</Label>
              <Input
                name="gender"
                value={formData.gender || ""}
                onChange={handleChange}
              />
              {errors.gender && <p className="text-xs text-red-500 mt-1">{errors.gender}</p>}
            </div>

            <div>
              <Label className="mb-2">Ngày sinh</Label>
              <Input
                type="date"
                name="dob"
                value={formData.dob ? formData.dob.split("T")[0] : ""}
                onChange={handleChange}
              />
              {errors.dob && <p className="text-xs text-red-500 mt-1">{errors.dob}</p>}
            </div>

            <div>
              <Label className="mb-2">Email</Label>
              <Input
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label className="mb-2">Số điện thoại</Label>
              <Input
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <Label className="mb-2">Địa chỉ</Label>
              <Input
                name="address"
                value={formData.address || ""}
                onChange={handleChange}
              />
              {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
            </div>
          </div>

          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b py-1">
      <span className="font-medium text-gray-700">{label}:</span>
      <span className="text-gray-600 text-right">{value || "—"}</span>
    </div>
  );
}
