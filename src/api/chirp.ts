import type { Request, Response } from "express";
import { BadRequestError } from "../errors.js";
import { createChirp } from "../db/queries/chrips.js";
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
    createAt: chirp.createdAt,
    updatedAt: chirp.updaetdAt,
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
