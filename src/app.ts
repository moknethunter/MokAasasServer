import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// ─── Routers ───
import { authRouter } from "./modules/auth/auth.routes.js";
import { provisionRouter } from "./modules/provision/provision.module.js";
import { numbersRouter } from "./modules/numbers/numbers.module.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

export function createApp(): Express {
  const app = express();

  // ═══════════════════════════════════════════════════
  // 1. Middleware
  // ═══════════════════════════════════════════════════
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  // ═══════════════════════════════════════════════════
  // 2. API Routes
  // ═══════════════════════════════════════════════════
  // مسارات المصادقة (تسجيل الدخول، إنشاء حساب)
  app.use("/api/auth", authRouter);

  // مسارات توليد الملف السري (للتطبيقات)
  app.use("/api/provision", provisionRouter);

  // مسارات إدارة الأرقام (للمدير)
  app.use("/api/numbers", numbersRouter);

  // ═══════════════════════════════════════════════════
  // 3. Static Files & UI
  // ═══════════════════════════════════════════════════
  app.use(express.static(publicDir));

  // توجيه الصفحة الرئيسية إلى صفحة تسجيل الدخول
  app.get("/", (_req, res) => {
    res.redirect("/login.html");
  });

  return app;
}
