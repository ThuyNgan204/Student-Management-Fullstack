// app/api/dashboard/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [students, lecturers, departments, majors, classes, sections] =
      await Promise.all([
        prisma.students.count(),
        prisma.lecturers.count(),
        prisma.departments.count(),
        prisma.majors.count(),
        prisma.academic_class.count(),
        prisma.class_section.count(),
      ]);

    const total = students + lecturers + departments + majors + classes + sections;

    return NextResponse.json({
      stats: [
        { label: "Students", count: students, percent: ((students / total) * 100).toFixed(1) },
        { label: "Lecturers", count: lecturers, percent: ((lecturers / total) * 100).toFixed(1) },
        { label: "Departments", count: departments, percent: ((departments / total) * 100).toFixed(1) },
        { label: "Majors", count: majors, percent: ((majors / total) * 100).toFixed(1) },
        { label: "Classes", count: classes, percent: ((classes / total) * 100).toFixed(1) },
        { label: "Class Sections", count: sections, percent: ((sections / total) * 100).toFixed(1) },
      ],
    });
  } catch (error) {
    console.error("❌ Dashboard error:", error);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
