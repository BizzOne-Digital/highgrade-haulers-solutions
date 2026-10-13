import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { AdminUser } from "@/lib/models";
import { clientIp, isSameOrigin, jsonError, rateLimit } from "@/lib/security";
import { loginSchema } from "@/lib/validation";

export const runtime = "nodejs";

// Compared against when the email does not exist, so response timing does not reveal valid emails.
let dummyHash: string | null = null;
const getDummyHash = () => (dummyHash ??= bcrypt.hashSync("not-a-real-password", 12));

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return jsonError("Request origin not allowed.", 403);

  const ip = clientIp(req);
  if (!(await rateLimit(`login-ip:${ip}`, 10, 15 * 60))) {
    return jsonError("Too many login attempts. Please wait 15 minutes and try again.", 429);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request.", 400);
  }
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return jsonError("Enter a valid email and password.", 400);
  const { email, password } = parsed.data;

  if (!(await rateLimit(`login-user:${email}`, 8, 15 * 60))) {
    return jsonError("Too many login attempts. Please wait 15 minutes and try again.", 429);
  }

  try {
    await connectDB();
    const user = await AdminUser.findOne({ email }).select("+passwordHash");
    const ok = await bcrypt.compare(password, user?.passwordHash ?? getDummyHash());
    if (!user || !ok) return jsonError("Incorrect email or password.", 401);

    user.lastLoginAt = new Date();
    await user.save();
    await createSession(String(user._id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[login]", (err as Error).message);
    return jsonError("Login is temporarily unavailable. Please try again.", 503);
  }
}
