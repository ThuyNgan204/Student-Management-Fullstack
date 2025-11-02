import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/utils/auth";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const user = await getCurrentUser(req); // lấy user từ cookie
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { oldPassword, newPassword } = await req.json();

  const account = await prisma.user_account.findUnique({
    where: { user_id: user.user_id },
  });

  if (!account) return NextResponse.json({ message: "User not found" }, { status: 404 });

  const match = await bcrypt.compare(oldPassword, account.password);
  if (!match) return NextResponse.json({ message: "Mật khẩu cũ không đúng" }, { status: 400 });

  const hashed = await bcrypt.hash(newPassword, 10);

  await prisma.user_account.update({
    where: { user_id: user.user_id },
    data: { password: hashed },
  });

  return NextResponse.json({ message: "Đổi mật khẩu thành công" });
}
