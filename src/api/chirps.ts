import type { Request, Response } from "express";
import {
  BadRequestError,
  NotFoundError,
  UserForbiddenError,
} from "../errors.js";
import {
  createChirp,
  getChirp,
  getChirpByID,
  removeChirpByID,
} from "../db/queries/chirps.js";
import { respondWithJSON } from "../utils/json.js";
import { chirps } from "src/db/schema.js";

export async function handlerChirpsCreate(req: Request, res: Response) {
  type parameters = {
    body: string;
  };

  const params: parameters = req.body;
  if (!params.body) {
    throw new BadRequestError("Body is missing");
  }
  if (!req.userId) {
    throw new BadRequestError("User ID is missing");
  }

  const cleanBody = clean(validate(params.body));

  const chirp = await createChirp({
    body: cleanBody,
    userId: req.userId,
  });

  return respondWithJSON(res, 201, {
    id: chirp.id,
    createdAt: chirp.createdAt,
    updatedAt: chirp.updatedAt,
    body: chirp.body,
    userId: chirp.userId,
  });

  function validate(chirp: string) {
    const maxChirpLength = 140;
    if (chirp.length > maxChirpLength) {
      throw new BadRequestError(
        `Chirp is too long. Max length is ${maxChirpLength}`,
      );
    }
    return chirp;
  }
  function clean(chirp: string) {
    const profaneWords = ["kerfuffle", "sharbert", "fornax"];
    const cleanWords = chirp.split(" ").map((word) => {
      const lowercaseWord = word.toLowerCase();
      if (profaneWords.includes(lowercaseWord)) {
        return "****";
      }
      return word;
    });
    return cleanWords.join(" ");
  }
}

export async function handlerChirpsRetrieve(req: Request, res: Response) {
  let authorId = "";
  if (req.query.authorId && typeof req.query.authorId === "string") {
    authorId = req.query.authorId;
  }

  const chirps = await getChirp(authorId);

  let sortDirection = "asc";
  if (req.query.sort && typeof req.query.sort === "string") {
    sortDirection = req.query.sort;
  }

  chirps.sort((a, b) =>
    sortDirection == "asc"
      ? a.createdAt.getTime() - b.createdAt.getTime()
      : b.createdAt.getTime() - a.createdAt.getTime(),
  );

  return respondWithJSON(res, 200, chirps);
}

export async function handlerChirpsRetrieveByID(req: Request, res: Response) {
  const { chirpId } = req.params;
  if (typeof chirpId !== "string") {
    throw new BadRequestError("chirpId not provided");
  }

  const chirp = await getChirpByID(chirpId);
  if (!chirp) {
    throw new NotFoundError(`Chirp with id: ${chirpId} not found`);
  }

  respondWithJSON(res, 200, chirp);
}

export async function handlerChirpsDeleteByID(req: Request, res: Response) {
  const { chirpId } = req.params;
  if (typeof chirpId !== "string") {
    throw new BadRequestError("chirpId not not provided");
  }
  const chirp = await getChirpByID(chirpId);
  if (!chirp) {
    throw new NotFoundError(`Chirp with id: ${chirpId} not found`);
  }

  if (!req.userId) {
    throw new BadRequestError("User ID missing from request");
  }

  if (chirp.userId !== req.userId) {
    throw new UserForbiddenError(
      `Chirp with id: ${chirpId} does not belong to ${req.userId}`,
    );
  }

  const deleted = await removeChirpByID(chirpId);
  if (!deleted) {
    throw new Error(`Failed to delete chirp wth id:${chirpId}`);
  }

  return respondWithJSON(res, 204, {});
}
