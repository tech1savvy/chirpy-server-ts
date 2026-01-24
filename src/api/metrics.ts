import type { Request, Response } from "express";
import { config } from "../config.js";

export function handlerGetMetrics(_req: Request, res: Response) {
  res.set("Content-type", "text/html; charset=utf-8");
  res.send(`
<html>
  <body>
    <h1>Welcome, Chirpy Admin</h1>
    <p>Chirpy has been visited ${config.fileserverhits} times!</p>
  </body>
</html>
`);
}

export function handlerResetMetrics(_req: Request, res: Response) {
  config.fileserverhits = 0;
  res.send();
}
