// ==============================
// 📦 1. استيراد المكتبات اللازمة
// ==============================
import mongoose from "mongoose"; // مكتبة للتعامل مع MongoDB
import dotenv from "dotenv";     // مكتبة لتحميل المتغيرات من ملف .env
import app from "./app";         // استيراد تطبيق Express الرئيسي

// ==============================
// ⚙️ 2. إعداد متغيرات البيئة
// ==============================
dotenv.config(); // تحميل القيم من ملف .env إلى process.env

// ==============================
// 🌐 3. الاتصال بقاعدة البيانات
// ==============================
const DB_URI = process.env.DATABASE_URI || ""; // جلب رابط قاعدة البيانات من ملف .env

mongoose
  .connect(DB_URI) // الاتصال بقاعدة البيانات
  .then(() => console.log("✅ MongoDB Connected")) // في حال نجاح الاتصال
  .catch((err) => console.log("❌ Database connection error:", err)); // في حال حدوث خطأ

// ==============================
// 🚀 4. تشغيل الخادم (Server)
// ==============================
const port = process.env.PORT || 3000; // تحديد المنفذ (من .env أو 3000 كافتراضي)
const server = app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});

// ======================================================
// ⚠️ 5. التعامل مع الأخطاء غير المعالجة (Unhandled Rejections)
// ======================================================
//
// أحيانًا في Node.js يمكن أن يحدث "رفض للوعد" (Promise Rejection)
// بدون أن نستخدم try/catch أو .catch() لمعالجته.
// هذا القسم يلتقط مثل هذه الحالات ويغلق السيرفر بأمان.
//
// أمثلة على هذه الأخطاء: فشل الاتصال بقاعدة البيانات، خطأ في Promise، إلخ.
//
process.on("unhandledRejection", (err: any) => {
  console.log("💥 UNHANDLED REJECTION! Shutting down gracefully...");
  console.log("Error name:", err.name);
  console.log("Error message:", err.message);

  // إغلاق السيرفر أولاً بشكل آمن قبل إنهاء العملية
  server.close(() => {
    process.exit(1); // 1 = إنهاء بسبب خطأ
  });
});

/* 
🧠 ملاحظات للفهم:
- process: كائن عام في Node.js يمثل العملية الحالية.
- .on(): يربط مستمعًا (listener) بحدث معين (event).
- "unhandledRejection": هو الحدث الذي يُثار عند وجود وعد (Promise) تم رفضه دون معالجة.
*/
