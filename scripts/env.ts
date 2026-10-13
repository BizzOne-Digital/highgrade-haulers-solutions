/** Loads .env.local / .env for CLI scripts (Next.js does this automatically for the app). */
export function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    try {
      process.loadEnvFile(file);
    } catch {
      /* file not present */
    }
  }
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set. Add it to .env.local or your environment.");
    process.exit(1);
  }
}
