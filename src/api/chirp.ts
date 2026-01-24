import type { Request, Response } from "express";
import { respondWithError, respondWithJSON } from "../utils/json.js";
import { BadRequestError } from "../errors.js";

export function handlerValidateChirp(req: Request, res: Response) {
  type parameters = {
    body: string;
  };

  const params: parameters = req.body;
  if (!params.body || typeof params.body !== "string") {
    return respondWithError(res, 400, "Something went wrong");
  }

  const maxChirpLength = 140;
  if (params.body.length > maxChirpLength) {
    throw new BadRequestError(
      `Chirp is too long. Max length is ${maxChirpLength}`,
    );
  }

  const profaneWords = ["kerfuffle", "sharbert", "fornax"];
  const chirpWords = params.body.split(" ");
  console.log(chirpWords);
  const cleandWords = chirpWords.map((word) => {
    const lowercaseWord = word.toLowerCase();
    if (profaneWords.includes(lowercaseWord)) {
      return "****";
    }
    return word;
  });
  console.log(cleandWords);

  return respondWithJSON(res, 200, {
    cleanedBody: cleandWords.join(" "),
  });
}
