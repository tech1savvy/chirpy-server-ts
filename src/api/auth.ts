import type { Request, Response } from "express";
import { getUserByEmail } from "../db/queries/users.js";
import { BadRequestError, Unauthorised } from "../errors.js";
import { checkPasswordHash, makeRefreshToken } from "../utils/auth.js";
import { respondWithJSON } from "../utils/json.js";
import { UserResponse } from "./users.js";
import { makeJWT, getBearerToken } from "../utils/jwt.js";
import { config } from "../config.js";
import {
  createRefreshToken,
  revokeRefreshToken,
} from "../db/queries/refresh-token.js";
import { getUserFromRefreshToken } from "../db/queries/refresh-token.js";

type LoginResponse = UserResponse & {
  token: string;
  refreshToken: string;
};

export async function handlerLogin(req: Request, res: Response) {
  type parameters = {
    email: string;
    password: string;
  };

  const params: parameters = req.body;

  if (!params.email) {
    throw new BadRequestError("Email not provided");
  }
  if (!params.password) {
    throw new BadRequestError("Password not provided");
  }

  // Fetch User
  const user = await getUserByEmail(params.email);
  if (!user) {
    throw new Unauthorised("incorrect email or password");
  }

  // Match Password Hash
  const isAuthentic = await checkPasswordHash(
    params.password,
    user.hashed_password,
  );
  if (!isAuthentic) {
    throw new Unauthorised("incorrect email or password");
  }

  // Make Access Token
  const accessToken = makeJWT(
    user.id,
    config.jwt.secret,
    config.jwt.defautlDuration,
  );

  // Make Refresh Token
  const refreshToken = makeRefreshToken();
  const targetDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

  // Save Refersh Token
  createRefreshToken({
    userId: user.id,
    token: refreshToken,
    expiresAt: targetDate,
  });

  const { hashed_password, ...restUser } = user;
  const resUser: UserResponse = restUser;

  return respondWithJSON(res, 200, {
    ...resUser,
    token: accessToken,
    refreshToken,
  } satisfies LoginResponse);
}

type RefreshResponse = {
  token: string;
};

export async function handlerRefreshAccessToken(req: Request, res: Response) {
  const token = getBearerToken(req);
  const user = await getUserFromRefreshToken(token);
  if (!user) {
    throw new Unauthorised("Invalid refresh token");
  }
  if (!(user.expiresAt < new Date())) {
    throw new Unauthorised("Expired refresh token");
  }
  if (user.revoked_at) {
    throw new Unauthorised("Revoked refresh token");
  }

  const accessToken = makeJWT(
    user.userId,
    config.jwt.secret,
    config.jwt.defautlDuration,
  );

  return respondWithJSON(res, 200, {
    token: accessToken,
  } satisfies RefreshResponse);
}

export async function handlerRevokeRefreshToken(req: Request, res: Response) {
  const token = getBearerToken(req);
  const user = await getUserFromRefreshToken(token);
  if (!user) {
    throw new Unauthorised("Invalid refresh token");
  }

  await revokeRefreshToken(token);

  return res.status(204).send();
}
