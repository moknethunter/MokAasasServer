import bcrypt from 'bcryptjs';

const password = process.argv[2];
if (!password || password.length < 8) {
  console.error('❌ الاستخدام: npm run hash-password "كلمة-سر-8-أحرف-على-الأقل"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);
console.log('\n✅ انسخ هذا في .env كـ ADMIN_PASSWORD_HASH:\n');
console.log(hash);
console.log('\n(احتفظ بكلمة السر في مكان آمن — لن تُخزَّن في السيرفر)\n');
