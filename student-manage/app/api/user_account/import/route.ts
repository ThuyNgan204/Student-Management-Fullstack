import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json<any>(sheet);

    const users = await Promise.all(
      data.map(async (row) => {
        const hashedPassword = await bcrypt.hash(row.password || "admin123", 10);
        return prisma.user_account.create({
          data: {
            username: row.username,
            password: hashedPassword,
            role: row.role || "student",
            is_active: row.is_active ?? true,
          },
        });
      })
    );

    return NextResponse.json({ message: "Import successful", count: users.length });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ error: "Failed to import users" }, { status: 500 });
  }
}
