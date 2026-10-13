import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Booking } from "@/lib/models";
import { guardPublicForm } from "@/lib/public-form";
import { jsonError } from "@/lib/security";
import { bookingSchema, fieldIssues } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const guard = await guardPublicForm(req, "booking");
  if (guard.error) return guard.error;

  const parsed = bookingSchema.safeParse(guard.body);
  if (!parsed.success) {
    return jsonError("Please fix the highlighted fields.", 422, { fields: fieldIssues(parsed.error) });
  }

  try {
    await connectDB();
    const doc = await Booking.create({ ...parsed.data, status: "New" });
    // Only the reference id is returned; booking data is never exposed publicly.
    return NextResponse.json({ success: true, reference: String(doc._id).slice(-6).toUpperCase() }, { status: 201 });
  } catch (err) {
    console.error("[bookings] save failed:", (err as Error).message);
    return jsonError("We could not save your request right now. Please call or email us.", 503);
  }
}
