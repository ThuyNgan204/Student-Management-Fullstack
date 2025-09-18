// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export function middleware(req: NextRequest) {
//   const token = req.cookies.get("token");
//   if (!token && !req.nextUrl.pathname.startsWith("/auth")) {
//     return NextResponse.redirect(new URL("/auth/login", req.url));
//   }
//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/((?!_next|static|auth|api).*)"], // bảo vệ tất cả trừ /auth, /api
// };
