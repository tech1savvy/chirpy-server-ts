import type { Request, Response } from "express";
import { getUserByEmail } from "../db/queries/users.js";
import { NewUser } from "../db/schema.js";
import { BadRequestError } from "../errors.js";
import { checkPasswordHash } from "../utils/auth.js";
import { respondWithError, respondWithJSON } from "../utils/json.js";
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

  const user = await getUserByEmail(params.email);
  if (!user) {
    return respondWithError(res, 401, "incorrect email or password");
  }

  const isAuthentic = checkPasswordHash(params.password, user.hashed_password);
  if (!isAuthentic) {
    return respondWithError(res, 401, "incorrect email or password");
  }

  const resUser: Omit<NewUser, "hashed_password"> = user;
  respondWithJSON(res, 200, resUser);
}
