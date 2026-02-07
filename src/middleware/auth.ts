import type { Request, Response, NextFunction } from "express";
import { config } from "../config.js";
import { getBearerToken, validateJWT } from "../utils/jwt.js";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = getBearerToken(req);
  const userId = validateJWT(token, config.api.jwtSecret);
  req.body.userId = userId;

  next();
}
