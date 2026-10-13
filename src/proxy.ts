import { NextResponse, type NextRequest } from "next/server";

/**
 * Fast redirect for visitors without a session cookie. This is only a convenience layer:
 * every admin page and API validates the session against the database on the server.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();
  if (!req.cookies.get("hg_admin_session")?.value) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin", "/admin/:path*"] };
