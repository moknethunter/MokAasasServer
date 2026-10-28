import { Router } from "express";
import { rateLimit } from "../../middleware/rate-limit.js";
import { RATE_LIMITS } from "../../shared/constants.js";
import { verifyCredentials, issueSession, revokeSession, cookieOptions } from "./admin.service.js";
import { COOKIE_NAME } from "../../shared/constants.js";
import { logger } from "../../logger.js";

export const authRouter = Router();

authRouter.post(
  "/login",
  rateLimit({ max: RATE_LIMITS.LOGIN.max, windowMs: RATE_LIMITS.LOGIN.windowMs }),
  async (req, res) => {
    const { username, password } = req.body || {};
    if (typeof username !== "string" || typeof password !== "string") {
      return res.status(400).json({ error: "username and password required" });
    }

    const ok = await verifyCredentials(username, password);
    if (!ok) {
      logger.warn({ ip: req.ip, username }, "Failed admin login");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const { token } = await issueSession(username);
    res.cookie(COOKIE_NAME, token, cookieOptions);
    logger.info({ ip: req.ip, username }, "Admin login success");
    res.json({ ok: true, redirect: "/dashboard" });
  }
);

authRouter.post("/logout", async (req, res) => {
  const token = req.cookies?.[COOKIE_NAME] as string | undefined;
  if (token) await revokeSession(token);
  res.clearCookie(COOKIE_NAME);
  res.json({ ok: true });
});
