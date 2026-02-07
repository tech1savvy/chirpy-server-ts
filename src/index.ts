import express from "express";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";

import { middlewareLogResponses } from "./middleware/logger.js";
import { middlewareMetricsInc } from "./middleware/metrics.js";
import { middlewareErrorHandler } from "./middleware/error.js";
import { requireAuth } from "./middleware/auth.js";
import { handlerReadiness } from "./api/readiness.js";
import { handlerGetMetrics } from "./api/metrics.js";
import {
  handlerChirpsCreate,
  handlerChirpsRetrieve,
  handlerChirpsRetrieveByID,
} from "./api/chirps.js";
import { handlerReset } from "./api/reset.js";
import { handlerUsersCreate as handlerUsersCreate } from "./api/users.js";

import { config } from "./config.js";
import { handlerLogin } from "./api/auth.js";

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

const app = express();

app.use(middlewareLogResponses);
app.use(express.json());
app.use("/app", middlewareMetricsInc);
app.use("/app", express.static("./src/app"));

app.get("/admin/metrics", handlerGetMetrics);
app.post("/admin/reset", handlerReset);

app.get("/api/healthz", handlerReadiness);

app.get("/api/chirps", handlerChirpsRetrieve);
app.get("/api/chirps/:chirpID", handlerChirpsRetrieveByID);
app.post("/api/chirps", requireAuth, handlerChirpsCreate);

app.post("/api/users", handlerUsersCreate);
app.post("/api/login", handlerLogin);

app.use(middlewareErrorHandler);
app.listen(config.api.port, () => {
  console.log(`Server is running at http://localhost:${config.api.port}`);
});
