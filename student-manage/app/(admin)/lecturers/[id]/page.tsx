"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { formatDate } from "@/utils/date";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Loader2,
  Pencil,
  School,
  BookOpen,
  ArrowLeft,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Lecturer {
  lecturer_id: number;
  lecturer_code: string;
  first_name: string;
  last_name: string;
  gender?: string;
  dob?: string;
  phone?: string;
  email?: string;
  address?: string;
  position?: string;
  avatar?: string;
  departments?: { department_id: number, department_name: string, department_code: string };
  academic_class?: { class_name: string; class_code: string }[];
  class_section?: { section_name: string; section_code: string }[];
}

export default function LecturerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const lecturerId = params.id;

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [lecturerData, setLecturerData] = useState<Lecturer | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const {
    data: lecturer,
    isLoading,
    isError,
    refetch,
  } = useQuery<Lecturer>({
    queryKey: ["lecturer", lecturerId],
    queryFn: async () => {
      const res = await axios.get(`/api/lecturers/${lecturerId}`);
      return res.data;
    },
    enabled: !!lecturerId,
  });

  useEffect(() => {
    if (lecturer) {
      setLecturerData(lecturer);
      setFormData(lecturer);
    }
  }, [lecturer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await axios.put(`/api/lecturers/${lecturerId}`, formData);
      toast.success("Cập nhật thông tin giảng viên thành công!");
      setLecturerData(res.data);
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

  if (isError || !lecturerData)
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <p className="text-red-500 text-lg mb-4">
          Không thể tải thông tin giảng viên.
        </p>
        <Button onClick={() => router.push("/lecturers")}>Quay lại</Button>
      </div>
    );

  const fullName = `${lecturerData.last_name} ${lecturerData.first_name}`;

  return (
    <>
      {/* === Top Row with Back Button === */}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ==== LEFT SIDE ==== */}
        <Card className="col-span-1 flex flex-col items-center p-6">
          <div className="relative w-40 h-40 rounded-full overflow-hidden border shadow">
            <img
              src={
                lecturerData.avatar ||
                "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              }
              alt={fullName}
              className="w-40 h-40 rounded-full object-cover border shadow"
            />
          </div>

          <h2 className="mt-4 text-xl font-semibold">{fullName}</h2>
          <p className="text-gray-500 text-sm">{lecturerData.lecturer_code}</p>

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
              onClick={() => router.push(`/class_section?lecturer=${lecturerId}`)}
              
            >
              <BookOpen size={16} /> Các lớp học phần
            </Button>

            <Button
              variant="secondary"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => router.push(`/academic_class?lecturer=${lecturerId}`)}
            >
              <School size={16} /> Các lớp cố vấn
            </Button>
          </div>
        </Card>

        {/* ==== RIGHT SIDE ==== */}
        <div className="col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* --- Thông tin giảng viên --- */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin giảng viên</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <InfoRow label="Họ và tên" value={fullName} />
              <InfoRow label="Mã giảng viên" value={lecturerData.lecturer_code} />
              <InfoRow label="Giới tính" value={lecturerData.gender || "—"} />
              <InfoRow label="Ngày sinh" value={formatDate(lecturerData.dob || "")} />
              <InfoRow label="Email" value={lecturerData.email || "—"} />
              <InfoRow label="Số điện thoại" value={lecturerData.phone || "—"} />
              <InfoRow label="Địa chỉ" value={lecturerData.address || "—"} />
              <InfoRow label="Chức vụ" value={lecturerData.position || "—"} />
            </CardContent>
          </Card>

          {/* --- Thông tin khoa, lớp, học phần --- */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin giảng dạy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <InfoRow
                label="Khoa"
                value={lecturerData.departments?.department_name || "—"}
              />
              <InfoRow
                label="Mã Khoa"
                value={lecturerData.departments?.department_code || "—"}
              />
              <InfoRow
                label="Lớp cố vấn"
                value={
                  lecturerData.academic_class?.length
                    ? lecturerData.academic_class.map(cls => cls.class_code).join(", ")
                    : "—"
                }
              />
              <div className="pt-2">
                <p className="font-medium text-gray-700 mb-1">
                  Các lớp học phần đang giảng dạy:
                </p>
                {lecturerData.class_section?.length ? (
                  <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                    {lecturerData.class_section.map((sec, index) => (
                      <li key={index}>
                        {sec.section_code}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">Không có lớp học phần</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* === Edit Modal === */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin giảng viên</DialogTitle>
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
              <Label className="mb-2">Ảnh đại diện (URL)</Label>
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
              </div>
              <div>
                <Label className="mb-2">Tên</Label>
                <Input
                  name="first_name"
                  value={formData.first_name || ""}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <Label className="mb-2">Giới tính</Label>
              <Input
                name="gender"
                value={formData.gender || ""}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label className="mb-2">Ngày sinh</Label>
              <Input
                type="date"
                name="dob"
                value={formData.dob ? formData.dob.split("T")[0] : ""}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label className="mb-2">Email</Label>
              <Input
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label className="mb-2">Số điện thoại</Label>
              <Input
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label className="mb-2">Địa chỉ</Label>
              <Input
                name="address"
                value={formData.address || ""}
                onChange={handleChange}
              />
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
