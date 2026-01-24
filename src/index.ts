import express from "express";
import { middlewareLogResponses } from "./middleware/logger.js";
import { middlewareMetricsInc } from "./middleware/metrics.js";
import { middlewareErrorHandler } from "./middleware/error.js";
import { handlerReadiness } from "./api/readiness.js";
import { handlerGetMetrics, handlerResetMetrics } from "./api/metrics.js";
const app = express();
const PORT = 8080;

app.use(middlewareLogResponses);
app.use(express.json());
app.use("/app", middlewareMetricsInc);
app.use("/app", express.static("./src/app"));
app.get("/admin/metrics", handlerGetMetrics);
app.get("/admin/reset", handlerResetMetrics);
app.get("/api/healthz", handlerReadiness);
app.use(middlewareErrorHandler);
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
