import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import { createRequire } from "module";
import path from "path";
import type { IncomingMessage, ServerResponse } from "http";
import router from "./routes";
import { logger } from "./lib/logger";
import { pool } from "@workspace/db";

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required");
}

const _require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PgStore = (_require("connect-pg-simple") as any)(session) as new (opts?: any) => session.Store;

// On Replit the server is always behind HTTPS (even in "dev" mode).
// REPLIT_DEV_DOMAIN is injected automatically by Replit.
// This flag lets us set the right cookie attributes for cross-domain requests.
const IS_HTTPS = process.env.NODE_ENV === "production" || !!process.env.REPLIT_DEV_DOMAIN;

const app: Express = express();

// Trust the Replit/Netlify reverse-proxy so secure cookies work.
app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: IncomingMessage & { id?: string | number }) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res: ServerResponse) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

// Reflect the exact requesting origin so credentials work cross-domain.
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, origin || true);
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    store: new PgStore({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pool: pool as any,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      // SameSite=None + Secure=true required for cross-domain cookies (Netlify ↔ Replit).
      // Must be set whenever the server is accessed over HTTPS.
      secure: IS_HTTPS,
      sameSite: IS_HTTPS ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
);

const uploadsDir = path.join(process.cwd(), "uploads");
app.use("/api/uploads", express.static(uploadsDir));

app.use("/api", router);

export default app;
