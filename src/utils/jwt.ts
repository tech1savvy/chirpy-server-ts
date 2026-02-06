import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";
import { Unauthorised } from "../errors";

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
