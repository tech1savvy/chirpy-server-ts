import jwt, { JwtPayload } from "jsonwebtoken";
import { BadRequestError, Unauthorised } from "../errors.js";
import type { Request } from "express";
import { config } from "../config.js";

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export function makeJWT(userID: string, secret: string, expiresIn: number) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + expiresIn;

  return jwt.sign(
    {
      iss: "chirpy",
      sub: userID,
      iat: Math.floor(Date.now() / 1000),
      exp: expiresAt,
    } satisfies payload,
    secret,
    { algorithm: "HS256" },
  );
}

export function validateJWT(tokenString: string, secret: string) {
  let decoded: payload;
  try {
    decoded = jwt.verify(tokenString, secret) as JwtPayload;
  } catch (err) {
    throw new Unauthorised("Invalid token");
  }
  if (decoded.iss !== config.jwt.issuer) {
    throw new Unauthorised("Invalid issuer");
  }
  if (!decoded.sub) {
    throw new Unauthorised("No user ID in token");
  }
  return decoded.sub;
}

export function getBearerToken(req: Request): string {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    throw new Unauthorised("Malformed authorization header");
  }
  return extractBearerToken(authHeader);
}

export function extractBearerToken(header: string) {
  const splitAuth = header.split(" ");
  if (splitAuth.length < 2 || splitAuth[0] !== "Bearer") {
    throw new Unauthorised("Malformed authorization header");
  }
  return splitAuth[1];
}
