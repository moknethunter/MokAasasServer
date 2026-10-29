import { Router } from "express";
import { AuthService } from "./auth.service.js";
import { logger } from "../../logger.js";

export function createAuthRoutes(authService: AuthService): Router {
  const router = Router();

  router.post("/register", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) throw new Error("أدخل اسم المستخدم وكلمة المرور");
      
      const token = await authService.register(username, password);
      res.json({ ok: true, token });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.post("/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const token = await authService.login(username, password);
      res.json({ ok: true, token });
    } catch (err: any) {
      res.status(401).json({ error: err.message });
    }
  });

  return router;
}
