import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: { id: string } };

// ================= GET ONE =================
export async function GET(req: Request, { params }: Params) {
  const id = Number(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    const major = await prisma.majors.findUnique({
      where: { major_id: id },
      include: { departments: true },
    });
    if (!major) return NextResponse.json({ error: "Major not found" }, { status: 404 });
    return NextResponse.json(major);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch major" }, { status: 500 });
  }
}

// ================= UPDATE =================
export async function PUT(req: Request, { params }: Params) {
  const id = Number(params.id);
  const body = await req.json();
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    const major = await prisma.majors.update({
      where: { major_id: id },
      data: {
        major_code: body.major_code,
        major_name: body.major_name,
        department_id: body.department_id,
      },
    });
    return NextResponse.json(major);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update major" }, { status: 500 });
  }
}

// ================= DELETE =================
export async function DELETE(req: Request, { params }: Params) {
  const id = Number(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    await prisma.majors.delete({ where: { major_id: id } });
    return NextResponse.json({ message: "Major deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete major" }, { status: 500 });
  }
}
