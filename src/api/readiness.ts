import type { Request, Response } from "express";

export function handlerReadiness(_req: Request, res: Response) {
  res.set("Content-type", "text/plain; charset=utf-8");
  res.send("OK");
}
