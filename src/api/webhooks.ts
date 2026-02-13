import type { Request, Response } from "express";
import { BadRequestError, NotFoundError, Unauthorised } from "../errors.js";
import { upgradeUser } from "../db/queries/users.js";
import { getApiKey } from "../utils/auth.js";
import { config } from "../config.js";

type RequestBody = {
  event: string;
  data: {
    userId: string;
  };
};
export async function handlerUsersUpgrade(req: Request, res: Response) {
  const polkaApiKey = getApiKey(req);
  if (polkaApiKey !== config.api.polkaKey) {
    throw new Unauthorised("Invalid API key");
  }

  const body: RequestBody = req.body;
  if (!body.event && !body.data.userId) {
    throw new BadRequestError("Incomplete body");
  }
  if (body.event !== "user.upgraded") {
    return res.status(204).send();
  }
  const upgraded = upgradeUser(body.data.userId);
  if (!upgraded) {
    throw new NotFoundError("User not found");
  }
  return res.status(204).send();
}
