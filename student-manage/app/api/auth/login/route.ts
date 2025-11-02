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

    // 🔹 Lấy đầy đủ thông tin: role + student_id + lecturer_id
    const user = await prisma.user_account.findUnique({
      where: { username },
      select: {
        user_id: true,
        username: true,
        password: true,
        role: true,
        student_id: true,
        lecturer_id: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "Sai tài khoản hoặc mật khẩu" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: "Sai tài khoản hoặc mật khẩu" }, { status: 401 });
    }

    // 🔹 Tạo JWT token chứa thông tin cần thiết
    const token = jwt.sign(
      {
        userId: user.user_id,
        username: user.username,
        role: user.role,
        studentId: user.student_id,
        lecturerId: user.lecturer_id,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    // 🔹 Xác định redirect URL theo role
    const redirectMap: Record<string, string> = {
        admin: "/",
        lecturer: `/lecturers/${user.lecturer_id}`,
        student: `/students/${user.student_id}`,
        };

    const redirectUrl = redirectMap[user.role] || "/"

    const res = NextResponse.json(
      {
        message: "Đăng nhập thành công",
        redirectUrl,
        user: {
          user_id: user.user_id,
          username: user.username,
          role: user.role,
          student_id: user.student_id,
          lecturer_id: user.lecturer_id,
        },
      },
      { status: 200 }
    );

    // 🔹 Lưu token vào cookie
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
