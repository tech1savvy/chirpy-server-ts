import type { Request, Response } from "express";
import { reset } from "../db/queries/users.js";
import { UserForbiddenError } from "../errors.js";
import { config } from "../config.js";

export async function handlerReset(_req: Request, res: Response) {
  if (config.api.platform !== "dev") {
    console.log(config.api.platform);
    throw new UserForbiddenError(
      "Reset is allowd only on development platform",
    );
  }
  config.api.fileServerHits = 0;

  await reset();
  res.write("Hits reset to 0");
  res.end();
}
