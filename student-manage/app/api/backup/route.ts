import { exec } from "child_process";
import fs from "fs";
import { NextRequest } from "next/server";
import path from "path";

export async function GET(req: NextRequest) {
  return new Promise((resolve) => {
    const backupDir = path.join(process.cwd(), "backups");

    // Tạo thư mục nếu chưa có
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `backup_${timestamp}.sql`;
    const filePath = path.join(backupDir, fileName);

    // ⚠️ Thay DATABASE_URL của bạn vào đây
    const dbUrl = "postgresql://postgres:123456@localhost:5432/studentManage";

    // Thay đổi dumpCommand
  const pgDumpPath = `"C:\\Program Files\\PostgreSQL\\17\\bin\\pg_dump.exe"`; // <-- sửa theo PostgreSQL của bạn
  const dumpCommand = `${pgDumpPath} ${dbUrl} -f "${filePath}"`;

    exec(dumpCommand, (error) => {
      if (error) {
        console.error("Backup failed:", error);
        resolve(
          new Response(JSON.stringify({ message: "Backup failed" }), {
            status: 500,
          })
        );
        return;
      }

      // Đọc file và trả về để tải xuống
      const fileBuffer = fs.readFileSync(filePath);
      resolve(
        new Response(fileBuffer, {
          status: 200,
          headers: {
            "Content-Type": "application/sql",
            "Content-Disposition": `attachment; filename=${fileName}`,
          },
        })
      );
    });
  });
}
