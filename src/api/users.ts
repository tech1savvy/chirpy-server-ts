import type { Request, Response } from "express";
import { createUser } from "../db/queries/users.js";
import { users } from "../db/schema.js";
import { BadRequestError } from "../errors.js";
import { respondWithJSON } from "../utils/json.js";
import { hashPassword } from "../utils/auth.js";

type User = typeof users.$inferSelect;
export type UserResponse = Omit<User, "hashed_password">;

export async function handlerUsersCreate(req: Request, res: Response) {
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

  const user = await createUser({
    email: params.email,
    hashed_password: await hashPassword(params.password),
  });

  if (!user) {
    throw new Error("Could not create user");
  }

  return respondWithJSON(res, 201, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  } satisfies UserResponse);
}
