import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
export const numbersRouter = Router();

// 1. توزيع رقم جديد
numbersRouter.post("/provision", async (req, res) => {
  try {
    const { phoneNumber, username, password } = req.body;
    if (!phoneNumber || !username || !password) throw new Error("جميع الحقول مطلوبة");

    const existing = await prisma.user.findUnique({ where: { phoneNumber } });
    if (existing) throw new Error("هذا الرقم موجود مسبقاً في الشبكة");

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { phoneNumber, username, passwordHash, isActive: true }
    });

    res.json({ ok: true, message: `تم توزيع الرقم ${phoneNumber} بنجاح`, user });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 2. عرض جميع الأرقام
numbersRouter.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
