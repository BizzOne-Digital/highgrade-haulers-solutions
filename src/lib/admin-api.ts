import "server-only";
import { revalidatePath } from "next/cache";
import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";
import type { z } from "zod";
import { requireAdmin, type AdminIdentity } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { jsonError } from "@/lib/security";
import { fieldIssues } from "@/lib/validation";

/** Refreshes every public page after an admin content change. */
export function revalidatePublic() {
  revalidatePath("/", "layout");
}

type Params = Record<string, string>;
type Handler = (ctx: { req: Request; admin: AdminIdentity; params: Params }) => Promise<Response>;

/** Wraps an admin API handler: session + CSRF check, DB connection, safe error handling. */
export function adminRoute(handler: Handler) {
  return async (req: Request, routeCtx: { params: Promise<Params> }) => {
    const auth = await requireAdmin(req);
    if (auth.error) return auth.error;
    try {
      const params = (await routeCtx?.params) ?? {};
      await connectDB();
      return await handler({ req, admin: auth.admin, params });
    } catch (err) {
      console.error("[admin-api]", (err as Error).message);
      return jsonError("Something went wrong. Please try again.", 500);
    }
  };
}

export async function parseBody<T extends z.ZodType>(
  req: Request,
  schema: T,
): Promise<{ data: z.infer<T>; error?: never } | { error: Response; data?: never }> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return { error: jsonError("Invalid request body.", 400) };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fields = fieldIssues(parsed.error);
    return { error: jsonError(Object.values(fields)[0] ?? "Invalid input.", 422, { fields }) };
  }
  return { data: parsed.data };
}

export const ok = (data: Record<string, unknown> = {}) => NextResponse.json({ success: true, ...data });

export function validId(id: string) {
  return isValidObjectId(id) && /^[a-f0-9]{24}$/i.test(id);
}
