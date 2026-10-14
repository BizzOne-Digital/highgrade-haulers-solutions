import { after, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ContactLead } from "@/lib/models";
import { notifyNewLead } from "@/lib/notify";
import { guardPublicForm } from "@/lib/public-form";
import { jsonError } from "@/lib/security";
import { contactSchema, fieldIssues } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const guard = await guardPublicForm(req, "contact");
  if (guard.error) return guard.error;

  const parsed = contactSchema.safeParse(guard.body);
  if (!parsed.success) {
    return jsonError("Please fix the highlighted fields.", 422, { fields: fieldIssues(parsed.error) });
  }

  try {
    await connectDB();
    await ContactLead.create({ ...parsed.data, status: "New" });
    after(() => notifyNewLead(parsed.data));
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("[contact] save failed:", (err as Error).message);
    return jsonError("We could not save your message right now. Please call or email us.", 503);
  }
}
