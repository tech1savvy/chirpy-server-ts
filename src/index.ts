import express from "express";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";

import { middlewareLogResponses } from "./middleware/logger.js";
import { middlewareMetricsInc } from "./middleware/metrics.js";
import { middlewareErrorHandler } from "./middleware/error.js";
import { handlerReadiness } from "./api/readiness.js";
import { handlerGetMetrics, handlerResetMetrics } from "./api/metrics.js";
import { handlerValidateChirp } from "./api/chirp.js";

import { config } from "./config.js";

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

const app = express();

app.use(middlewareLogResponses);
app.use(express.json());
app.use("/app", middlewareMetricsInc);
app.use("/app", express.static("./src/app"));

app.get("/admin/metrics", handlerGetMetrics);
app.get("/admin/reset", handlerResetMetrics);

app.get("/api/healthz", handlerReadiness);
app.post("/api/validate_chirp", (req, res, next) => {
  Promise.resolve(handlerValidateChirp(req, res)).catch(next);
});

app.use(middlewareErrorHandler);
app.listen(config.api.port, () => {
  console.log(`Server is running at http://localhost:${config.api.port}`);
});
