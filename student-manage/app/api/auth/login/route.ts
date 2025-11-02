import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ message: "Thiếu tài khoản hoặc mật khẩu" }, { status: 400 });
    }

    const user = await prisma.user_account.findUnique({
      where: { username },
      select: { user_id: true, username: true, password: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ message: "Sai tài khoản hoặc mật khẩu" }, { status: 401 });
    }

    // ❗ Chỉ cho admin đăng nhập
    if (user.role !== "admin") {
      return NextResponse.json({ message: "Tài khoản không có quyền truy cập hệ thống" }, { status: 403 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: "Sai tài khoản hoặc mật khẩu" }, { status: 401 });
    }

    // Tạo token chỉ cần userId và role = admin
    const token = jwt.sign(
      { userId: user.user_id, username: user.username, role: "admin" },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    const res = NextResponse.json({ message: "Đăng nhập thành công", redirectUrl: "/" }, { status: 200 });

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return res;

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}
