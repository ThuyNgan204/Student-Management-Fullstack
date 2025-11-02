// /utils/auth.ts
import Cookies from "js-cookie";

export interface CurrentUser {
  user_id: number;
  username: string;
  role: string;
}

export async function getCurrentUser(req?: Request): Promise<CurrentUser | null> {
  try {
    // Nếu server-side
    if (req) {
      const cookie = req.headers.get("cookie") || "";
      const match = cookie
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith("user="));
      if (!match) return null;
      const json = decodeURIComponent(match.split("=")[1]);
      return JSON.parse(json);
    }

    // Nếu client-side
    const cookie = Cookies.get("user");
    if (!cookie) return null;
    return JSON.parse(cookie);
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
}
