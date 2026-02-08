import type { Request, Response } from "express";
import { getUserByEmail } from "../db/queries/users.js";
import { BadRequestError, Unauthorised } from "../errors.js";
import { checkPasswordHash } from "../utils/auth.js";
import { respondWithJSON } from "../utils/json.js";
import { UserResponse } from "./users.js";
import { makeJWT } from "../utils/jwt.js";
import { config } from "../config.js";

type LoginResponse = UserResponse & {
  token: string;
};

export async function handlerLogin(req: Request, res: Response) {
  type parameters = {
    email: string;
    password: string;
    expiresIn?: number;
  };

  const params: parameters = req.body;

  if (!params.email) {
    throw new BadRequestError("Email not provided");
  }
  if (!params.password) {
    throw new BadRequestError("Password not provided");
  }
  if (!params.expiresIn || params.expiresIn > 1 * 60 * 60) {
    params.expiresIn = 1 * 60 * 60;
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

  // Make JWT
  let duration = config.jwt.defautlDuration;
  if (params.expiresIn && !(params.expiresIn > config.jwt.defautlDuration)) {
    duration = params.expiresIn;
  }

  const token = makeJWT(user.id, config.jwt.secret, duration);

  const { hashed_password, ...restUser } = user;
  const resUser: UserResponse = restUser;

  return respondWithJSON(res, 200, {
    ...resUser,
    token,
  } satisfies LoginResponse);
}
