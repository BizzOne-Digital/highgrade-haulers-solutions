import "server-only";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { RateLimit } from "@/lib/models";

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function allowedOrigins(req: Request): Set<string> {
  const set = new Set<string>();
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  if (host) set.add(`${proto}://${host}`);
  for (const o of [process.env.NEXT_PUBLIC_SITE_URL, ...(process.env.ALLOWED_ORIGINS ?? "").split(",")]) {
    if (o && o.trim()) {
      try {
        set.add(new URL(o.trim()).origin);
      } catch {
        /* ignore malformed entries */
      }
    }
  }
  return set;
}

/**
 * CSRF defence for cookie-authenticated mutations: the browser-supplied Origin (or Referer)
 * must match this site. Combined with SameSite=Lax cookies.
 */
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  let source: string | null = origin;
  if (!source && referer) {
    try {
      source = new URL(referer).origin;
    } catch {
      source = null;
    }
  }
  if (!source) return false;
  return allowedOrigins(req).has(source);
}

/** Returns true when the request is allowed. Fails open if the limiter itself errors. */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  try {
    await connectDB();
    const now = Date.now();
    const windowStart = Math.floor(now / (windowSeconds * 1000));
    const doc = await RateLimit.findOneAndUpdate(
      { key: `${key}:${windowStart}` },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((windowStart + 1) * windowSeconds * 1000) } },
      { upsert: true, new: true },
    ).lean();
    return (doc?.count ?? 0) <= limit;
  } catch (err) {
    console.error("[rate-limit]", (err as Error).message);
    return true;
  }
}

export function jsonError(message: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ success: false, error: message, ...extra }, { status });
}
