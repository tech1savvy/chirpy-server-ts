import { describe, it, expect, beforeAll, vi } from "vitest";
import { getBearerToken, makeJWT, validateJWT } from "./jwt";
import { Unauthorised } from "../errors";
import type { Request } from "express";

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

describe("Get Bearer Token", () => {
  it("should return token from valid Authorization header", () => {
    const req = {
      get: vi.fn().mockReturnValue("Bearer token"),
    } as Pick<Request, "get">;

    const token = getBearerToken(req as Request);

    expect(req.get).toBeCalledWith("Authorization");
    expect(token).toBe("token");
  });

  it("should throw error for absent Authorization header", () => {
    const req = { get: vi.fn().mockReturnValue(undefined) } as Pick<
      Request,
      "get"
    >;

    expect(() => getBearerToken(req as Request)).toThrow(Unauthorised);
    expect(req.get).toBeCalledWith("Authorization");
  });
});
