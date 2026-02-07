import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";
import { Unauthorised } from "../errors.js";
import type { Request } from "express";

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

const TOKEN_ISSUER = "chirpy";

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
  if (decoded.iss !== TOKEN_ISSUER) {
    throw new Unauthorised("Invalid token");
  }
  if (!decoded.sub) {
    throw new Unauthorised("Invalid token");
  }
  return decoded.sub;
}

export function getBearerToken(req: Request): string {
  const header = req.get("Authorization");
  if (!header) {
    throw new Unauthorised("Invalid token");
  }
  const token = header.split(" ")[1];
  if (!token) {
    throw new Unauthorised("Invalid token");
  }
  return token;
}
