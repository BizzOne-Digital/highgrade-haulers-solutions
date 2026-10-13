import "server-only";
import { antiSpam } from "@/lib/validation";
import { clientIp, jsonError, rateLimit } from "@/lib/security";

const MIN_FILL_MS = 2500;

/**
 * Shared guard for public form endpoints: JSON body, honeypot, minimum fill time and
 * per-IP rate limiting. Returns the parsed body or an error response.
 */
export async function guardPublicForm(
  req: Request,
  bucket: string,
): Promise<{ body: Record<string, unknown>; error?: never; silent?: never } | { error: Response; body?: never }> {
  const ip = clientIp(req);
  if (!(await rateLimit(`${bucket}:${ip}`, 5, 10 * 60))) {
    return { error: jsonError("Too many submissions. Please wait a few minutes or call us directly.", 429) };
  }
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return { error: jsonError("Invalid request.", 400) };
  }
  if (!body || typeof body !== "object") return { error: jsonError("Invalid request.", 400) };
  const spam = antiSpam.safeParse(body);
  const tooFast = typeof body.startedAt === "number" && Date.now() - body.startedAt < MIN_FILL_MS;
  if (!spam.success || tooFast) {
    return { error: jsonError("We could not accept this submission. Please call or email us instead.", 400) };
  }
  return { body };
}
