import { describe, it, expect, beforeAll, vi } from "vitest";
import { makeJWT, validateJWT } from "./jwt";
import { Unauthorised } from "../errors";

describe("JWT Utils", () => {
  const userId = "0001";
  const secret = "top-secret";
  const expiresIn = 5;

  let token: string;

  beforeAll(() => {
    vi.useFakeTimers();
    token = makeJWT(userId, secret, expiresIn);
  });

  it("should return userId for valid token", () => {
    const result = validateJWT(token, secret);
    expect(result).toBe(userId);
  });
  it("should reject for expired token", () => {
    vi.advanceTimersByTime((expiresIn + 5) * 1000);

    expect(() => validateJWT(token, secret)).toThrowError(Unauthorised);

    vi.useRealTimers();
  });
  it("should reject for wrong secret", () => {
    expect(() => validateJWT(token, "wrong-secret")).toThrowError(Unauthorised);
  });
});
