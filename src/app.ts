import express from "express";
import { numbersRouter } from "./modules/numbers/numbers.module.js";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createAuthRoutes } from "./modules/auth/auth.routes.js";
import { AuthService } from "./modules/auth/auth.service.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

export function createApp(authService: AuthService) {
  const app = express();
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());
app.use("/api/numbers", numbersRouter);
  app.use("/api/auth", createAuthRoutes(authService));
  app.use(express.static(publicDir));
  
  app.get("/", (req, res) => res.redirect("/login.html"));
  
  return app;
}
