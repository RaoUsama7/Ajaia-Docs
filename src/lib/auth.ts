import { cookies } from "next/headers";
import { db } from "@/lib/db";

const DEMO_USER_COOKIE = "ajaia-demo-user";
const DEFAULT_USER_EMAIL = "alex@ajaia.demo";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const selectedId = cookieStore.get(DEMO_USER_COOKIE)?.value;
  if (selectedId) {
    const selected = await db.user.findUnique({ where: { id: selectedId } });
    if (selected) return selected;
  }
  const fallback = await db.user.findUnique({ where: { email: DEFAULT_USER_EMAIL } });
  if (!fallback) throw new Error("Demo users are missing. Run `npm run db:seed` and refresh.");
  return fallback;
}

export async function setCurrentUserCookie(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(DEMO_USER_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}
