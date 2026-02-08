import { describe, it, expect, beforeAll, vi } from "vitest";
import {
  extractBearerToken,
  getBearerToken,
  makeJWT,
  validateJWT,
} from "./jwt";
import { BadRequestError, Unauthorised } from "../errors";
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
  it("should throw an error for expired token", () => {
    vi.advanceTimersByTime((expiresIn + 5) * 1000);

    expect(() => validateJWT(token, secret)).toThrow(Unauthorised);

    vi.useRealTimers();
  });
  it("should throw an error for wrong secret", () => {
    expect(() => validateJWT(token, "wrong-secret")).toThrow(Unauthorised);
  });
  it("should throw an error for a invalid token string", () => {
    expect(() => validateJWT("invalid-token-string", secret)).toThrow(
      Unauthorised,
    );
  });
});

describe("extractBearerToken", () => {
  it("should extract the token from a valid header", () => {
    const token = "secret-token";
    const header = `Bearer ${token}`;
    expect(extractBearerToken(header)).toBe(token);
  });

  it("should extract the token even if there are extra parts", () => {
    const token = "secret-token";
    const header = `Bearer ${token} some-extra-part`;
    expect(extractBearerToken(header)).toBe(token);
  });

  it("should throw a BadRequestError if the header does not contain at least two parts", () => {
    const header = "Bearer";
    expect(() => extractBearerToken(header)).toThrow(BadRequestError);
  });

  it('should throw a BadRequestError if the header does not start with "Bearer"', () => {
    const header = `Not-Bearer token`;
    expect(() => extractBearerToken(header)).toThrow(BadRequestError);
  });

  it("should throw a BadRequestError if the header is an empty string", () => {
    const header = "";
    expect(() => extractBearerToken(header)).toThrow(BadRequestError);
  });
});
