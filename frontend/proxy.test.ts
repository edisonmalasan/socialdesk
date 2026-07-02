import { test, expect } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "./proxy";

function makeRequest(pathname: string, cookies: Record<string, string> = {}) {
  const cookieHeader = Object.entries(cookies)
    .map(([key, value]) => `${key}=${value}`)
    .join("; ");
  return new NextRequest(`http://localhost:3000${pathname}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : {},
  });
}

function isPassThrough(response: ReturnType<typeof proxy>) {
  return response.headers.get("x-middleware-next") === "1";
}

test("redirects an authenticated user away from /login", () => {
  const response = proxy(makeRequest("/login", { "auth-token": "tok" }));

  expect(response.status).toBe(307);
  expect(response.headers.get("location")).toBe("http://localhost:3000/");
});

test("redirects an authenticated user away from /register", () => {
  const response = proxy(makeRequest("/register", { "auth-token": "tok" }));

  expect(response.headers.get("location")).toBe("http://localhost:3000/");
});

test("allows an unauthenticated user to view /login", () => {
  const response = proxy(makeRequest("/login"));

  expect(isPassThrough(response)).toBe(true);
});

test("redirects an unauthenticated user away from a protected page", () => {
  const response = proxy(makeRequest("/dashboard"));

  expect(response.status).toBe(307);
  expect(response.headers.get("location")).toBe("http://localhost:3000/login");
});

test("redirects a non-admin user away from /management", () => {
  const response = proxy(
    makeRequest("/management", { "auth-token": "tok", "user-role": "user" }),
  );

  expect(response.headers.get("location")).toBe("http://localhost:3000/dashboard");
});

test("redirects a non-admin user away from /accounts", () => {
  const response = proxy(
    makeRequest("/accounts", { "auth-token": "tok", "user-role": "user" }),
  );

  expect(response.headers.get("location")).toBe("http://localhost:3000/dashboard");
});

test("allows an admin user to view /management", () => {
  const response = proxy(
    makeRequest("/management", { "auth-token": "tok", "user-role": "admin" }),
  );

  expect(isPassThrough(response)).toBe(true);
});

test("allows an authenticated user to view a non-admin protected page", () => {
  const response = proxy(
    makeRequest("/dashboard", { "auth-token": "tok", "user-role": "user" }),
  );

  expect(isPassThrough(response)).toBe(true);
});

test("defaults role to 'user' when the user-role cookie is missing", () => {
  const response = proxy(makeRequest("/management", { "auth-token": "tok" }));

  expect(response.headers.get("location")).toBe("http://localhost:3000/dashboard");
});
