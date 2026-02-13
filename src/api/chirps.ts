import type { Request, Response } from "express";
import { BadRequestError, NotFoundError } from "../errors.js";
import { createChirp, getChirp, getChirpByID } from "../db/queries/chirps.js";
import { respondWithJSON } from "../utils/json.js";

export async function handlerChirpsCreate(req: Request, res: Response) {
  type parameters = {
    body: string;
    userId: string;
  };

  const params: parameters = req.body;
  if (!params.body) {
    throw new BadRequestError("Body is missing");
  }
  if (!params.userId) {
    throw new BadRequestError("User ID is missing");
  }

  const cleanBody = clean(validate(params.body));

  const chirp = await createChirp({
    body: cleanBody,
    userId: params.userId,
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

export async function handlerChirpsRetrieve(_req: Request, res: Response) {
  const chirps = await getChirp();
  return respondWithJSON(res, 200, chirps);
}

export async function handlerChirpsRetrieveByID(req: Request, res: Response) {
  const { chirpID } = req.params;
  if (typeof chirpID !== "string") {
    throw new BadRequestError("chirpID not provided");
  }

  const chirp = await getChirpByID(chirpID);
  if (!chirp) {
    throw new NotFoundError(`Chirp with id: ${chirpID} not found`);
  }

  respondWithJSON(res, 200, chirp);
}
