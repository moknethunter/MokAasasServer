import { Router } from "express";
import { AuthService } from "./auth.service.js";

export function createAuthRoutes(authService: AuthService): Router {
  const router = Router();

  router.post("/register", async (req, res) => {
    try {
      const { phoneNumber, username, password } = req.body;
      if (!phoneNumber || !username || !password) throw new Error("جميع الحقول مطلوبة");
      
      const token = await authService.register(phoneNumber, username, password);
      res.json({ ok: true, token, name: username });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.post("/login", async (req, res) => {
    try {
      const { phoneNumber, password } = req.body;
      if (!phoneNumber || !password) throw new Error("رقم الهاتف وكلمة المرور مطلوبة");
      
      const token = await authService.login(phoneNumber, password);
      // فك التوكن لمعرفة الاسم
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      res.json({ ok: true, token, name: payload.name });
    } catch (err: any) {
      res.status(401).json({ error: err.message });
    }
  });

  return router;
}
