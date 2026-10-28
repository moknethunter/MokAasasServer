# ✅ Voice Server — Master Checklist

> **القاعدة:** المسار هو مصدر الحقيقة. الترقيم مرجع ثانوي فقط.
> عند الشك في ملف: افتح GitHub → ابحث عن **المسار** مباشرة.

**آخر تحديث:** المرحلة 0 مكتملة
**التقدم الكلي:** [████████░░] المرحلة 0 / 6

---

## 🎯 المرحلة 0 — التأسيس (46 ملفاً)

### 📦 الجذر (7 ملفات)

- [ ] `package.json`
- [ ] `tsconfig.json`
- [ ] `.gitignore`
- [ ] `.env.example`
- [ ] `.prettierrc`
- [ ] `.eslintrc.cjs`
- [ ] `NOTES.md`

### 📦 prisma/ (1 ملف)

- [ ] `prisma/schema.prisma`

### 📦 scripts/ (1 ملف)

- [ ] `scripts/hash-password.ts`

### 📦 docs/adr/ (4 ملفات)

- [ ] `docs/adr/template.md`
- [ ] `docs/adr/0001-auth-model.md` ← **يحتاج قرارك (A/B/C)**
- [ ] `docs/adr/0002-e2ee-mode.md` ← **يحتاج قرارك (A/B/C)**
- [ ] `docs/adr/0003-deployment-target.md` ← **يحتاج قرارك (A/B)**

### 📦 public/ (2 ملفان)

- [ ] `public/login.html`
- [ ] `public/dashboard.html`

### 📦 src/ — Core (7 ملفات)

- [ ] `src/config.ts`
- [ ] `src/logger.ts`
- [ ] `src/errors.ts`
- [ ] `src/metrics.ts`
- [ ] `src/network.ts`
- [ ] `src/index.ts` ← **النسخة النهائية (من الدفعة الثانية)**
- [ ] `src/app.ts` ← **النسخة النهائية (من الدفعة الثانية)**

### 📦 src/shared/ (4 ملفات)

- [ ] `src/shared/error-codes.ts`
- [ ] `src/shared/constants.ts`
- [ ] `src/shared/validators.ts`
- [ ] `src/shared/types.ts`

### 📦 src/middleware/ (5 ملفات)

- [ ] `src/middleware/correlation.ts`
- [ ] `src/middleware/request-logger.ts`
- [ ] `src/middleware/error-handler.ts`
- [ ] `src/middleware/rate-limit.ts`
- [ ] `src/middleware/admin-only.ts`

### 📦 src/ports/ (5 ملفات)

- [ ] `src/ports/session-store.ts`
- [ ] `src/ports/user-repo.ts`
- [ ] `src/ports/client-connection.ts`
- [ ] `src/ports/event-bus.ts`
- [ ] `src/ports/health-check.ts`

### 📦 src/adapters/ (4 ملفات)

- [ ] `src/adapters/session/memory.ts`
- [ ] `src/adapters/users/postgres.ts`
- [ ] `src/adapters/connection/ws.ts`
- [ ] `src/adapters/events/local.ts`

### 📦 src/modules/ (4 ملفات)

- [ ] `src/modules/health/routes.ts`
- [ ] `src/modules/auth/admin.service.ts`
- [ ] `src/modules/auth/admin.routes.ts`
- [ ] `src/modules/admin/overview.routes.ts` ← **الملف الذي كاد يضيع**

---

## 🧪 اختبارات ما بعد الرفع

### 1. تحقق من عدد الملفات
```bash
# في لابتوب بعد استنساخ
find . -type f \( -name "*.ts" -o -name "*.json" -o -name "*.html" -o -name "*.prisma" -o -name "*.md" \) \
  ! -path "./node_modules/*" ! -path "./dist/*" ! -path "./.git/*" | wc -l
# يجب: 46 (أو 45 إن لم تُنشئ .prettierrc بعد)
