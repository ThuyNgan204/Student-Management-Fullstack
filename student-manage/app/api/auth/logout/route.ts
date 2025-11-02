import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ message: "Đã đăng xuất" }, { status: 200 });

  // Xóa cookie token
  res.cookies.set("token", "", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });

  return res;
}
