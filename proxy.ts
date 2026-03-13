import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicPath = path === "/login" || path === "/register";
  const token = request.cookies.get("auth-token")?.value || "";
  
  // 1. Grab the user's role from cookies
  const role = request.cookies.get("user-role")?.value || "user";

  // 2. Define which paths require admin privileges
  const isAdminPath = path.startsWith("/management") || path.startsWith("/accounts");

  // SCENARIO A: User is on public page but logged in -> Go to Dashboard
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  // SCENARIO B: User is on protected page but NOT logged in -> Go to Login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  // SCENARIO C: Logged-in user tries to access admin page but is NOT an admin -> Go to Dashboard
  if (isAdminPath && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
  }

  return NextResponse.next();
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
    "/management", 
    "/profile",    
    "/notifications", 
    "/login",
    "/register"
  ],
};