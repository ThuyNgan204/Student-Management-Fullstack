// /app/api/enrollment/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { enrollment_id: id },
      include: {
        students: true,
        class_section: { include: { courses: true, lecturers: true } },
        grades: true,
      },
    });
    if (!enrollment) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(enrollment);
  } catch (err) {
    console.error("GET /api/enrollment/[id] error:", err);
    return NextResponse.json({ error: "Failed to fetch enrollment" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const body = await req.json();

  try {
    const updated = await prisma.enrollment.update({
      where: { enrollment_id: id },
      data: {
        status: body.status,
      },
      include: {
        students: true,
        class_section: true,
      },
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT /api/enrollment/[id] error:", err);
    return NextResponse.json({ error: "Failed to update enrollment" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const deleted = await prisma.enrollment.delete({ where: { enrollment_id: id } });
    return NextResponse.json({ message: "Deleted", deleted });
  } catch (err) {
    console.error("DELETE /api/enrollment/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete enrollment" }, { status: 500 });
  }
}
