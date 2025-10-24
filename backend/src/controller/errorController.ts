import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";

/**
 * ============================================================
 * ⚙️ Global Error Handler Middleware
 * ============================================================
 * الهدف (Purpose):
 * - التعامل مع جميع الأخطاء في المشروع بطريقة موحدة (Centralized Error Handling)
 * - تحويل أخطاء MongoDB وMongoose إلى رسائل مفهومة للمستخدم
 * - فصل طريقة عرض الخطأ بين بيئة التطوير (dev) وبيئة الإنتاج (prod)
 */

/**
 * ============================================================
 * 🧩 handleCastErrorDB
 * ============================================================
 * - التعامل مع الأخطاء الناتجة عن تمرير ID غير صالح (مثل ObjectId غير صحيح)
 * - Example: /api/users/123 → invalid ID
 */
const handleCastErrorDB = (err: any): AppError => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  // إنشاء خطأ جديد من النوع AppError مع رسالة وكود 400 (Bad Request)
  return new AppError(message, 400);
};

/**
 * ============================================================
 * 🧩 handleDuplicateFieldsDB
 * ============================================================
 * - معالجة الخطأ الناتج عن وجود قيمة مكررة (مثل email أو username)
 * - MongoDB throws: code 11000
 */
const handleDuplicateFieldsDB = (err: any): AppError => {
  const value = Object.values(err.keyValue).join(", ");
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

/**
 * ============================================================
 * 🧩 handleValidationErrorDB
 * ============================================================
 * - معالجة أخطاء التحقق من صحة البيانات (Validation Errors)
 * - Example: إدخال email غير صحيح أو حقل مطلوب مفقود
 */
const handleValidationErrorDB = (err: any): AppError => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

/**
 * ============================================================
 * 🚧 sendErrorDev
 * ============================================================
 * - تُستخدم في بيئة التطوير (development)
 * - تعرض كل تفاصيل الخطأ: الرسالة + stack trace + الكائن الكامل
 */
const sendErrorDev = (err: AppError, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack, // مفيد أثناء الـ debugging
  });
};

/**
 * ============================================================
 * 🏭 sendErrorProd
 * ============================================================
 * - تُستخدم في بيئة الإنتاج (production)
 * - تخفي التفاصيل الحساسة وتعرض فقط رسالة واضحة للمستخدم
 * - إذا كان الخطأ "تشغيلي" (isOperational = true) → نعرضه للمستخدم
 * - غير ذلك → نعرض رسالة عامة "Something went wrong"
 */
const sendErrorProd = (err: AppError, res: Response) => {
  if (err.isOperational) {
    // ✅ خطأ متوقع (مثل invalid input, not found...)
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // 💥 خطأ برمجي أو غير متوقع → لا نعرض التفاصيل للمستخدم
    console.error("ERROR 💥", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
};

/**
 * ============================================================
 * 🧠 globalErrorHandler (Middleware)
 * ============================================================
 * - هذا هو الميدلوير المركزي لمعالجة الأخطاء
 * - يُستدعى تلقائيًا من Express عند استدعاء next(error)
 */
const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // تأكد أن كل خطأ يحتوي على statusCode و status
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  console.log(err);

  // 🧪 إذا كنا في بيئة التطوير → أظهر كل التفاصيل
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  }
  // 🏭 أما في بيئة الإنتاج → أظهر فقط الرسائل المناسبة
  else if (process.env.NODE_ENV === "production") {
    let error = { ...err };

    // 🎯 تحديد نوع الخطأ ومعالجته بناءً على خصائصه
    if (err.name === "CastError") error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err._message === "Validation failed") error = handleValidationErrorDB(err);

    sendErrorProd(error as AppError, res);
  }
};

// 📤 تصدير الميدلوير لاستخدامه في app.ts أو server.ts
export default globalErrorHandler;
