import type { Request, Response, NextFunction } from "express";
import { respondWithError } from "../utils/json.js";
import {
  BadRequestError,
  Unauthorised,
  UserNotAuthenticated,
  UserForbiddenError,
  NotFoundError,
} from "../errors.js";

export function middlewareErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  let statusCode = 500;
  let message = "Something went wrong on our end";

  if (err instanceof BadRequestError) {
    statusCode = 400;
    message = err.message;
  }
  if (err instanceof Unauthorised) {
    statusCode = 401;
    message = err.message;
  }
  if (err instanceof UserNotAuthenticated) {
    statusCode = 402;
    message = err.message;
  }
  if (err instanceof UserForbiddenError) {
    statusCode = 403;
    message = err.message;
  }
  if (err instanceof NotFoundError) {
    statusCode = 404;
    message = err.message;
  }

  // Log only non-internal error message
  if (statusCode >= 500) {
    console.log(err.message);
  }

  respondWithError(res, statusCode, message);
}
