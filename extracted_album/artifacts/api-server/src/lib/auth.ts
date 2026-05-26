import type { Request, Response, NextFunction } from "express";

declare module "express-session" {
  interface SessionData {
    memberId?: number;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.session.memberId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.session.memberId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
