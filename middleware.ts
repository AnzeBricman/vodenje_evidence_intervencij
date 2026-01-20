import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });

  const isLoggedIn = !!token;

  const isProtected =
    req.nextUrl.pathname.startsWith("/dashboard") ||
    req.nextUrl.pathname.startsWith("/interventions") ||
    req.nextUrl.pathname.startsWith("/vehicles") ||
    req.nextUrl.pathname.startsWith("/equipment") ||
    req.nextUrl.pathname.startsWith("/users");

  if (!isLoggedIn && isProtected) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/interventions/:path*",
    "/vehicles/:path*",
    "/equipment/:path*",
    "/users/:path*",
  ],
};
