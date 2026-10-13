import Link from "next/link";

export default function NotFound() {
  return (
    <main className="texture-dark grid min-h-dvh place-items-center px-4 text-center text-white">
      <div>
        <p className="eyebrow text-brand">404</p>
        <h1 className="display mt-3 text-6xl sm:text-7xl">Nothing to haul here.</h1>
        <p className="mt-4 text-white/80">The page you are looking for does not exist.</p>
        <Link href="/" className="btn btn-primary mt-8">
          Back to Home
        </Link>
      </div>
    </main>
  );
}
