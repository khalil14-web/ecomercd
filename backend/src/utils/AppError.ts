/**
 * ============================================================
 * 🧩 Custom Error Class: AppError
 * ============================================================
 * 🎯 الهدف (Purpose):
 * - إنشاء فئة مخصصة للأخطاء لتوحيد شكل رسائل الخطأ في المشروع.
 * - This class standardizes how errors are created and handled.
 * - It helps differentiate between operational errors (handled) 
 *   and programming bugs (unexpected errors).
 */

class AppError extends Error {
  public statusCode: number;   // 🔢 كود حالة HTTP مثل 404 أو 500
  public status: string;       // ⚙️ "fail" للأخطاء 4xx و "error" للأخطاء 5xx
  public isOperational: boolean; // ✅ يحدد ما إذا كان الخطأ متوقعًا (handled)

  /**
   * ------------------------------------------------------------
   * 🔧 Constructor
   * يتم استدعاؤه عند إنشاء كائن جديد من AppError.
   * Example: throw new AppError("User not found", 404)
   * ------------------------------------------------------------
   * @param message - نص رسالة الخطأ (error message)
   * @param statusCode - كود الحالة HTTP
   */
  constructor(message: string, statusCode: number) {
    /**
     * 🧠 super(message):
     * - تستدعي الـ constructor الخاص بـ class الأم (Error).
     * - Initializes the built-in "message" property inherited from Error.
     */
    super(message);

    // 💾 حفظ كود الحالة في الخاصية المخصصة داخل الكائن
    this.statusCode = statusCode;

    /**
     * 🧩 تحديد نوع الخطأ تلقائيًا بناءً على الكود:
     * - يبدأ بـ 4 → "fail" → خطأ من جهة العميل (Client Error)
     * - يبدأ بـ 5 → "error" → خطأ من جهة الخادم (Server Error)
     */
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";

    /**
     * ✅ isOperational:
     * - يميز بين الأخطاء المتوقعة (Operational) وغير المتوقعة (Programming bugs)
     * - مثال على خطأ متوقع: "User not found"
     * - مثال على خطأ غير متوقع: "Cannot read property of undefined"
     */
    this.isOperational = true;

    /**
     * 🧾 Error.captureStackTrace:
     * - يضيف “stack trace” لتوضيح مكان وقوع الخطأ في الكود.
     * - stack trace = تسلسل استدعاءات الدوال التي أدت إلى هذا الخطأ.
     * - Helps developers trace errors easily during debugging.
     */
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
