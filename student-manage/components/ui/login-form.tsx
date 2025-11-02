"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Cookies from "js-cookie"; // ✅ thêm dòng này
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    setErrorMessage("");
    if (!username || !password) {
      setErrorMessage("Vui lòng nhập đầy đủ tài khoản và mật khẩu");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        // ✅ Lưu cookie để RoleBasedSidebar đọc được
        Cookies.set("user", JSON.stringify(data.user), { expires: 1 }); // 1 ngày
        if (data.token) {
          Cookies.set("token", data.token, { expires: 1 });
        }

        // ✅ Chuyển hướng
        router.push(data.redirectUrl || "/");
      } else {
        setErrorMessage(data.message || "Đăng nhập thất bại");
      }
    } catch (error) {
      setLoading(false);
      setErrorMessage("Lỗi kết nối. Vui lòng thử lại");
      console.error(error);
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

        <CardContent>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="username" className="mb-2">Tài khoản</Label>
              <Input
                id="username"
                placeholder="Nhập tài khoản"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="password" className="mb-2">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {errorMessage && (
              <p className="text-red-600 text-sm">{errorMessage}</p>
            )}

            <Button
              onClick={handleLogin}
              className="w-full bg-blue-900 hover:bg-blue-800"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={18} /> Đang đăng nhập...
                </div>
              ) : (
                "Đăng nhập"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
