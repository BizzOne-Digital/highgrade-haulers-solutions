/**
 * Creates (or resets) an admin account: `npm run create-admin`
 *
 * Reads ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME from the environment (or --email / --password / --name).
 * - Without --reset it refuses to touch an existing account.
 * - With --reset it replaces that account's password and signs out its sessions.
 * Passwords are hashed with bcrypt; nothing is stored or logged in plain text.
 */
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { loadEnv } from "./env";

loadEnv();

function arg(name: string) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}

async function main() {
  const email = (arg("email") ?? process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = arg("password") ?? process.env.ADMIN_PASSWORD ?? "";
  const name = arg("name") ?? process.env.ADMIN_NAME ?? "";
  const reset = process.argv.includes("--reset");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Set ADMIN_EMAIL (or --email) to a valid email address.");
  const strong = password.length >= 12 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password);
  if (!strong) throw new Error("ADMIN_PASSWORD must be at least 12 characters with upper-case, lower-case, and a number.");

  const { connectDB } = await import("../src/lib/db");
  const { AdminUser, AdminSession } = await import("../src/lib/models");
  await connectDB();

  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await AdminUser.findOne({ email });
  if (existing && !reset) {
    console.log(`An admin with ${email} already exists. Nothing changed. Use --reset to set a new password.`);
    return;
  }
  if (existing) {
    existing.passwordHash = passwordHash;
    if (name) existing.name = name;
    await existing.save();
    await AdminSession.deleteMany({ userId: existing._id });
    console.log(`Password reset for ${email}. Existing sessions were signed out.`);
  } else {
    await AdminUser.create({ email, name, passwordHash });
    console.log(`Admin created: ${email}`);
  }
  console.log("Remove ADMIN_PASSWORD from your environment files now that the account exists.");
}

main()
  .catch((err) => {
    console.error("create-admin failed:", (err as Error).message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
