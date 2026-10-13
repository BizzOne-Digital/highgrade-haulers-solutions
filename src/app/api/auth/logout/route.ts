import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";
import { isSameOrigin, jsonError } from "@/lib/security";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return jsonError("Request origin not allowed.", 403);
  await destroySession();
  return NextResponse.json({ success: true });
}
