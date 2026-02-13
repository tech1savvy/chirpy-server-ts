import argon2 from "argon2";
import { randomBytes } from "node:crypto";
import { Unauthorised } from "../errors.js";
import type { Request } from "express";

export async function hashPassword(password: string) {
  return argon2.hash(password);
}

export async function checkPasswordHash(password: string, hash: string) {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

export function makeRefreshToken() {
  return randomBytes(32).toString("hex");
}

export function getApiKey(req: Request) {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    throw new Unauthorised("Malformed authorization header");
  }
  return extractApiKey(authHeader);
}

export function extractApiKey(header: string) {
  const splitAuth = header.split(" ");
  if (splitAuth.length < 2 || splitAuth[0] !== "ApiKey") {
    throw new Unauthorised("Malformed authorization header");
  }
  return splitAuth[1];
}
