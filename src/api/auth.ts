import type { Request, Response } from "express";
import { getUserByEmail } from "../db/queries/users.js";
import { BadRequestError, Unauthorised } from "../errors.js";
import { checkPasswordHash } from "../utils/auth.js";
import { respondWithJSON } from "../utils/json.js";
import { users } from "../db/schema.js";

type User = typeof users.$inferSelect;
type UserResponse = Omit<User, "hashed_password">;

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
    throw new Unauthorised("incorrect email or password");
  }

  const isAuthentic = await checkPasswordHash(
    params.password,
    user.hashed_password,
  );
  if (!isAuthentic) {
    throw new Unauthorised("incorrect email or password");
  }

  const { hashed_password, ...restUser } = user;
  const resUser: UserResponse = restUser;

  return respondWithJSON(res, 200, resUser);
}
