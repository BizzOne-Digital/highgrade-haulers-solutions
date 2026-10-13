import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import { AdminSession, AdminUser } from "@/lib/models";
import { isSameOrigin, jsonError } from "@/lib/security";

export const SESSION_COOKIE = "hg_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export type AdminIdentity = { id: string; email: string; name: string };

export async function createSession(userId: string) {
  await connectDB();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await AdminSession.create({ tokenHash: hashToken(token), userId, expiresAt });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    try {
      await connectDB();
      await AdminSession.deleteOne({ tokenHash: hashToken(token) });
    } catch {
      /* cookie is cleared regardless */
    }
  }
  jar.delete(SESSION_COOKIE);
}

/** Server-validated session lookup. Returns null when missing, expired, or the user no longer exists. */
export async function getAdmin(): Promise<AdminIdentity | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token || token.length > 128) return null;
  try {
    await connectDB();
    const session = await AdminSession.findOne({ tokenHash: hashToken(token), expiresAt: { $gt: new Date() } }).lean();
    if (!session) return null;
    const user = await AdminUser.findById(session.userId).lean();
    if (!user) return null;
    return { id: String(user._id), email: user.email, name: user.name ?? "" };
  } catch (err) {
    console.error("[auth]", (err as Error).message);
    return null;
  }
}

/**
 * Guard for admin API routes. Mutating methods also require a same-origin request (CSRF).
 * Returns either the admin identity or a ready-to-return error response.
 */
export async function requireAdmin(
  req: Request,
): Promise<{ admin: AdminIdentity; error?: never } | { admin?: never; error: Response }> {
  if (req.method !== "GET" && req.method !== "HEAD" && !isSameOrigin(req)) {
    return { error: jsonError("Request origin not allowed.", 403) };
  }
  const admin = await getAdmin();
  if (!admin) return { error: jsonError("Authentication required.", 401) };
  return { admin };
}
