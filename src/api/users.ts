import type { Request, Response } from "express";
import { createUser, updateUser } from "../db/queries/users.js";
import { users } from "../db/schema.js";
import { BadRequestError } from "../errors.js";
import { respondWithError, respondWithJSON } from "../utils/json.js";
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

type UpdateRequestBody = {
  email: string;
  password: string;
};

export async function handlerUsersUpdate(req: Request, res: Response) {
  // Check req.body
  const body: UpdateRequestBody = req.body;
  if (!body.email) {
    throw new BadRequestError("No new password or email provided");
  }
  if (!body.password) {
    throw new BadRequestError("No new password or email provided");
  }

  if (!req.userId) {
    throw new Error("User ID missing from request");
  }

  const hashedPassword = await hashPassword(body.password);
  const user = await updateUser(req.userId, {
    email: body.email,
    hashed_password: hashedPassword,
  });

  return respondWithJSON(res, 200, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  } satisfies UserResponse);
}
