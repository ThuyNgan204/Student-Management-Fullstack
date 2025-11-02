"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Cookies from "js-cookie";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ChangePasswordPage() {
  const router = useRouter();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const user = Cookies.get("user") ? JSON.parse(Cookies.get("user")!) : null;
  const username = user?.username;
  const role = user?.role;

  const handleSubmit = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMessage("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Mật khẩu mới và xác nhận không khớp!");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Đổi mật khẩu
      const changeRes = await fetch("http://localhost:3000/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, oldPassword, newPassword }),
      });

      const changeData = await changeRes.json();

      if (!changeRes.ok) {
        setErrorMessage(changeData.message || "Đổi mật khẩu thất bại");
        setLoading(false);
        return;
      }

      setSuccessMessage("Đổi mật khẩu thành công! Đang đăng nhập...");

      // 2️⃣ Tự login lại với mật khẩu mới
      const loginRes = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password: newPassword }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        setErrorMessage(loginData.message || "Đăng nhập tự động thất bại");
        setLoading(false);
        return;
      }

      // 3️⃣ Lưu cookie
      Cookies.set("user", JSON.stringify(loginData.user), { expires: 1 });
      if (loginData.token) Cookies.set("token", loginData.token, { expires: 1 });

      // 4️⃣ Redirect theo role
      if (loginData.user.role === "admin") router.push("/");
      else if (loginData.user.role === "lecturer") router.push(`/lecturers/${loginData.user.lecturer_id}`);
      else if (loginData.user.role === "student") router.push(`/students/${loginData.user.student_id}`);
    } catch (error: any) {
      setErrorMessage("Lỗi kết nối. Vui lòng thử lại");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-blue-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-none backdrop-blur-md bg-white/95">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold text-blue-900">
            HỆ THỐNG QUẢN LÝ SINH VIÊN
          </CardTitle>
          <CardDescription className="text-sm text-gray-600">
            Trường Đại học Ngân hàng TP. Hồ Chí Minh
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {errorMessage && <p className="text-red-600 text-sm">{errorMessage}</p>}
          {successMessage && <p className="text-green-600 text-sm">{successMessage}</p>}

          <div>
            <Label className="mb-2">Nhập mật khẩu cũ</Label>
            <div className="relative">
              <Input
                type={showOld ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <span
                className="absolute right-2 top-2 cursor-pointer"
                onClick={() => setShowOld(!showOld)}
              >
                {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </div>

          <div>
            <Label className="mb-2">Mật khẩu mới</Label>
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <span
                className="absolute right-2 top-2 cursor-pointer"
                onClick={() => setShowNew(!showNew)}
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </div>

          <div>
            <Label className="mb-2">Xác nhận mật khẩu mới</Label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <span
                className="absolute right-2 top-2 cursor-pointer"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              className="flex-1 bg-blue-900 hover:bg-blue-800"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
              Đổi mật khẩu
            </Button>
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Quay lại
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
