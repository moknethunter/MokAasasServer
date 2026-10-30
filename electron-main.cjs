const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

// 1. تحديد مكان قاعدة البيانات
// نضع قاعدة البيانات في مجلد AppData الخاص بالمستخدم لتجنب مشاكل صلاحيات الكتابة
const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'dev.db');
process.env.DATABASE_URL = `file:${dbPath}`;

// إعدادات البيئة الافتراضية
process.env.NODE_ENV = 'production';
process.env.PORT = '3000';
process.env.HOST = '127.0.0.1';
process.env.SESSION_SECRET = 'my-super-secret-session-key-64-chars-long-for-electron-app';
process.env.ADMIN_USERNAME = 'admin';
process.env.ADMIN_PASSWORD_HASH = '$2a$12$e0B.3K3wQ.4xG1U2F3g4H5j6K.7L8m9N0b1V2c3X4z5L6m7N8b9V0c1X';

// 2. نسخ قاعدة البيانات لأول مرة
if (!fs.existsSync(dbPath)) {
  // نبحث عن الملف في مجلد الموارد (الذي يأتي مع التطبيق)
  const templateDb = path.join(process.resourcesPath, 'dev.db');
  if (fs.existsSync(templateDb)) {
    fs.copyFileSync(templateDb, dbPath);
  }
}

// 3. تشغيل السيرفر
try {
  require('./dist/index.js');
} catch (err) {
  console.error("Failed to start server:", err);
}

// 4. فتح النافذة الرسومية
function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 850,
    title: "MokAsas Server",
    autoHideMenuBar: true,
    backgroundColor: '#050814',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // ننتظر قليلاً حتى يعمل السيرفر، ثم نفتح الواجهة
  setTimeout(() => {
    win.loadURL('http://127.0.0.1:3000');
  }, 2000);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
