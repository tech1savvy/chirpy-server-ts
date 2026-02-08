import { db } from "../index.js";
import { NewRefreshToken, refreshTokens } from "../schema.js";

export async function createRefreshToken(refreshToken: NewRefreshToken) {
  await db.insert(refreshTokens).values(refreshToken);
}
