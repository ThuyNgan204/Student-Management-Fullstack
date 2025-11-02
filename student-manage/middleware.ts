import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  // Những route không cần token
  const publicPaths = ["/login", "/api/auth"];

  // Nếu route bắt đầu bằng bất kỳ path nào trong publicPaths → cho đi
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Nếu chưa đăng nhập → chuyển hướng về /login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Nếu đã đăng nhập → cho đi
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/", // chặn trang chủ
    "/((?!_next|.*\\..*).*)", // chặn toàn bộ route, trừ static files
  ],
};
