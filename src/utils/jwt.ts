import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";
import { Unauthorised } from "../errors.js";
import type { Request } from "express";

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export function makeJWT(
  userID: string,
  secret: string,
  expiresIn: number,
): string {
  return jwt.sign(
    {
      iss: "chirpy",
      sub: userID,
      iat: Math.floor(Date.now() / 1000),
    } satisfies payload,
    secret,
    { expiresIn },
  );
}

export function validateJWT(tokenString: string, secret: string): string {
  try {
    const { sub } = jwt.verify(tokenString, secret);
    if (!sub) {
      throw new Unauthorised("Invalid token");
    }
    return sub.toString();
  } catch (err) {
    throw new Unauthorised("Invalid token");
  }
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
