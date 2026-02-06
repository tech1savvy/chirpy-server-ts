import type { Request, Response } from "express";
import { createUser } from "../db/queries/users.js";
import { BadRequestError } from "../errors.js";
import { respondWithJSON } from "../utils/json.js";

export async function handlerUsersCreate(req: Request, res: Response) {
  type parameters = {
    email: string;
  };

  const params: parameters = req.body;

  if (!params.email) {
    throw new BadRequestError("Email not provided");
  }

  const user = await createUser({
    email: params.email,
  });

  if (!user) {
    throw new Error("Could not create user");
  }

  return respondWithJSON(res, 201, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
}
