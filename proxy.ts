import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Updated to 'proxy' instead of 'middleware' because "middleware" is deprecated
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicPath = path === "/login" || path === "/register";
  const token = request.cookies.get("auth-token")?.value || "";

  // SCENARIO A: User is on public page but logged in -> Go to Dashboard
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  // SCENARIO B: User is on protected page but NOT logged in -> Go to Login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }
}

export const config = {
  matcher: [
    "/",
    "/dashboard",
    "/schedule",
    "/analytics",
    "/accounts",
    "/posts",
    "/settings",
    "/login",
    "/signup",
  ],
};