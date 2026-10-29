import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { config } from "../../config.js";

const prisma = new PrismaClient();
export const provisionRouter = Router();

// 1. مسار للمدير: توليد رقم سري وإنشاء ملف الاتصال
provisionRouter.post("/generate", async (req, res) => {
  try {
    const { phoneNumber, username } = req.body;
    if (!phoneNumber || !username) throw new Error("رقم الهاتف والاسم مطلوبان");

    const existing = await prisma.user.findUnique({ where: { phoneNumber } });
    if (existing) throw new Error("هذا الرقم موجود مسبقاً على الشبكة");

    // توليد المفتاح السري (UUID)
    const secretToken = crypto.randomUUID();

    // إنشاء المستخدم في قاعدة البيانات
    await prisma.user.create({
      data: { phoneNumber, username, secretToken, isActive: true }
    });

    // الحصول على رابط السيرفر الحالي تلقائياً
    const serverUrl = req.protocol + '://' + req.get('host'); 
    
    // تجهيز محتوى "ملف الاتصال"
    const connectionFile = {
      appName: "MokAsas Network",
      serverUrl: serverUrl,
      phoneNumber: phoneNumber,
      secretToken: secretToken,
      generatedAt: new Date().toISOString()
    };

    // إرسال الملف ليتم تحميله على جهاز المدير
    res.setHeader('Content-Disposition', `attachment; filename="MokAsas-${phoneNumber}.mok"`);
    res.setHeader('Content-Type', 'application/json');
    res.json(connectionFile);
    
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 2. مسار للتطبيق: الدخول باستخدام الملف السري
provisionRouter.post("/login", async (req, res) => {
  try {
    const { secretToken } = req.body;
    if (!secretToken) throw new Error("الملف السري مطلوب");

    const user = await prisma.user.findUnique({ where: { secretToken } });
    if (!user || !user.isActive) throw new Error("الملف السري غير صالح أو الحساب موقوف");

    // توليد توكن الدخول (صالح لـ 30 يوم)
    const token = jwt.sign(
      { phone: user.phoneNumber, name: user.username, role: user.role },
      config.SESSION_SECRET,
      { expiresIn: "30d" }
    );

    res.json({ ok: true, token, phoneNumber: user.phoneNumber, name: user.username });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});
