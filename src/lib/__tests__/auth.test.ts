import { describe, test, expect, vi, beforeEach } from "vitest";
import { SignJWT } from "jose";

vi.mock("server-only", () => ({}));

const mockCookieGet = vi.fn();
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve({ get: mockCookieGet })),
}));

const JWT_SECRET = new TextEncoder().encode("development-secret-key");

async function makeToken(payload: object, expirationTime = "7d") {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expirationTime)
    .setIssuedAt()
    .sign(JWT_SECRET);
}

describe("getSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns null when auth-token cookie is absent", async () => {
    mockCookieGet.mockReturnValue(undefined);
    const { getSession } = await import("@/lib/auth");
    const result = await getSession();
    expect(result).toBeNull();
  });

  test("returns session payload for a valid token", async () => {
    const token = await makeToken({
      userId: "user_123",
      email: "test@example.com",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    mockCookieGet.mockReturnValue({ value: token });

    const { getSession } = await import("@/lib/auth");
    const result = await getSession();

    expect(result).not.toBeNull();
    expect(result?.userId).toBe("user_123");
    expect(result?.email).toBe("test@example.com");
  });

  test("returns null for a malformed token", async () => {
    mockCookieGet.mockReturnValue({ value: "not.a.valid.jwt" });
    const { getSession } = await import("@/lib/auth");
    const result = await getSession();
    expect(result).toBeNull();
  });

  test("returns null for an expired token", async () => {
    const expiredAt = Math.floor(Date.now() / 1000) - 60; // 1 minute ago
    const token = await makeToken(
      { userId: "user_123", email: "test@example.com" },
      expiredAt
    );
    mockCookieGet.mockReturnValue({ value: token });

    const { getSession } = await import("@/lib/auth");
    const result = await getSession();
    expect(result).toBeNull();
  });
});
