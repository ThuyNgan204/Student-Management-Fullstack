import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// ================= GET ONE =================
// GET /api/user_accounts/:id
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const userId = Number(id);

  if (isNaN(userId)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  try {
    const account = await prisma.user_account.findUnique({
      where: { user_id: userId },
      include: {
        lecturers: true,
        students: true,
      },
    });

    if (!account) {
      return NextResponse.json({ error: "User account not found" }, { status: 404 });
    }

    return NextResponse.json(account);
  } catch (error) {
    console.error("GET user_account error:", error);
    return NextResponse.json({ error: "Failed to fetch user account" }, { status: 500 });
  }
}

// ================= UPDATE =================
// PUT /api/user_accounts/:id
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const userId = Number(id);
  const body = await req.json();

  if (isNaN(userId)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  try {
    const data: any = {
      username: body.username,
      role: body.role,
      student_id: body.student_id || null,
      lecturer_id: body.lecturer_id || null,
    };

    if (body.password) {
      data.password = await bcrypt.hash(body.password, 10);
    }

    const updated = await prisma.user_account.update({
      where: { user_id: userId },
      data,
      include: {
        lecturers: true,
        students: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT user_account error:", error);
    return NextResponse.json({ error: "Failed to update user account" }, { status: 500 });
  }
}

// ================= DELETE =================
// DELETE /api/user_accounts/:id
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const userId = Number(id);

  if (isNaN(userId)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  try {
    const deleted = await prisma.user_account.delete({
      where: { user_id: userId },
    });

    return NextResponse.json({ message: "User account deleted", deleted });
  } catch (error) {
    console.error("DELETE user_account error:", error);
    return NextResponse.json({ error: "Failed to delete user account" }, { status: 500 });
  }
}
