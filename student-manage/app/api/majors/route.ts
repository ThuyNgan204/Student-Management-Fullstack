import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ================= GET ALL =================
// GET /api/majors
export async function GET() {
  try {
    const majors = await prisma.majors.findMany({
      include: {
        departments: true,
      },
    });
    return NextResponse.json(majors);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch majors" }, { status: 500 });
  }
}

// ================= CREATE =================
// POST /api/majors
export async function POST(req: Request) {
  const body = await req.json();

  try {
    const major = await prisma.majors.create({
      data: {
        major_code: body.major_code,
        major_name: body.major_name,
        department_id: body.department_id,
      },
    });
    return NextResponse.json(major);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create major" }, { status: 500 });
  }
}
