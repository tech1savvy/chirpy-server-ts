import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewRefreshToken, refreshTokens } from "../schema.js";

export async function createRefreshToken(refreshToken: NewRefreshToken) {
  await db.insert(refreshTokens).values(refreshToken);
}

export async function getUserFromRefreshToken(token: string) {
  const rows = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.token, token));

  if (rows.length === 0) {
    return;
  }
  return rows[0];
}

export async function revokeRefreshToken(token: string) {
  await db
    .update(refreshTokens)
    .set({ revoked_at: new Date() })
    .where(eq(refreshTokens.token, token));
}
