import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// ─── Modules ───
import { createAuthRoutes } from "./modules/auth/auth.routes.js";
import { provisionRouter } from "./modules/provision/provision.module.js";
import { numbersRouter } from "./modules/numbers/number.module.js";
import { AuthService } from "./modules/auth/auth.service.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

export function createApp(authService: AuthService): Express {
  const app = express();

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  // ═══════════════════════════════════════════════════
  // API Routes
  // ═══════════════════════════════════════════════════
  app.use("/api/auth", createAuthRoutes(authService));
  app.use("/api/provision", provisionRouter);
  app.use("/api/numbers", numbersRouter);

  // Static UI
  app.use(express.static(publicDir));
  app.get("/", (_req, res) => res.redirect("/login.html"));

  return app;
}
