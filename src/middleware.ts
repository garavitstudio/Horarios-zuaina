import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req: NextRequest & { auth: unknown }) => {
  const isLoggedIn = !!(req as { auth: { user?: unknown } | null }).auth?.user;
  const pathname = req.nextUrl.pathname;
  console.log("MIDDLEWARE URL:", req.nextUrl.clone().href, "PATHNAME:", pathname);

  const basePath = "/app_horarios";
  const publicPaths = [`${basePath}/login`, `${basePath}/api/auth`];
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  if (!isLoggedIn && !isPublic) {
    const loginUrl = new URL(`${basePath}/login`, req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|images).*)",
  ],
};
