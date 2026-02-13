import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewUser, User, users } from "../schema.js";

export async function createUser(user: NewUser) {
  const [result] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function reset() {
  await db.delete(users);
}

export async function getUserByEmail(email: string) {
  const rows = await db.select().from(users).where(eq(users.email, email));
  if (rows.length === 0) {
    return;
  }
  return rows[0];
}

export async function updateUser(
  userId: string,
  data: Partial<Pick<User, "email" | "hashed_password">>,
) {
  const [row] = await db
    .update(users)
    .set(data)
    .where(eq(users.id, userId))
    .returning();
  return row;
}
