/**
 * ============================================================
 * ⚙️ Class: APIFeatures
 * ============================================================
 * الهدف (Purpose):
 * - تُستخدم لبناء الاستعلامات الديناميكية (Dynamic Queries) في MongoDB.
 * - تساعد على تطبيق الفلترة، الترتيب، تحديد الحقول، والصفحات (pagination)
 *   من خلال المعاملات القادمة من المستخدم (req.query).
 *
 * Example:
 * new APIFeatures(Model.find(), req.query)
 *   .filter()
 *   .sort()
 *   .limitFields()
 *   .paginate();
 */

import { Query } from "mongoose";

class APIFeatures<T> {
  public query: Query<T[], T>; // 🔹 كائن الاستعلام الخاص بـ Mongoose (Mongoose query object)
  private queryString: Record<string, any>; // 🔹 المعاملات القادمة من المستخدم (Client query parameters)

  /**
   * ------------------------------------------------------------
   * 🏗️ Constructor
   * يتم استدعاؤه عند إنشاء كائن جديد من APIFeatures
   * ------------------------------------------------------------
   * @param query - استعلام Mongoose مثل Model.find()
   * @param queryString - معاملات البحث القادمة من req.query
   */
  constructor(query: Query<T[], T>, queryString: Record<string, any>) {
    this.query = query;
    this.queryString = queryString;
  }

  /**
   * ============================================================
   * 🔍 FILTER
   * ============================================================
   * - يزيل الحقول الخاصة بالفرز أو التحديد أو الصفحات.
   * - يضيف معاملات MongoDB مثل $gte و $lte تلقائيًا.
   * Example: ?price[gte]=500 → { price: { $gte: 500 } }
   */
  filter(): this {
    const queryObj = { ...this.queryString }; // نسخ الكائن الأصلي لتجنّب تغييره
    const excludeFields = ["page", "sort", "limit", "fields"]; // الحقول التي لا تُستخدم للفلترة

    excludeFields.forEach((el) => delete queryObj[el]); // حذف الحقول غير المرغوبة

    // تحويل الكائن إلى string للبحث عن المشغّلات (operators)
    let queryStr = JSON.stringify(queryObj);

    // 🔁 استبدال gte, gt, lte, lt بـ $gte, $gt, ...
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // تطبيق الفلترة على الاستعلام
    this.query = this.query.find(JSON.parse(queryStr));

    return this; // لتمكين "method chaining"
  }

  /**
   * ============================================================
   * ↕️ SORT
   * ============================================================
   * - يسمح بترتيب النتائج حسب حقل معين (مثل السعر أو التاريخ)
   * Example: ?sort=price,-rating
   */
  sort(): this {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" "); // تحويل الفاصلة إلى مسافة
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt"); // ترتيب افتراضي بالتاريخ تنازليًا
    }
    return this;
  }

  /**
   * ============================================================
   * 🧩 LIMIT FIELDS
   * ============================================================
   * - يسمح للمستخدم بتحديد الحقول المراد عرضها فقط.
   * Example: ?fields=name,price → يعرض فقط هذين الحقلين
   */
  limitFields(): this {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v"); // إخفاء حقل النسخة الداخلية افتراضيًا
    }
    return this;
  }

  /**
   * ============================================================
   * 📄 PAGINATION
   * ============================================================
   * - لتقسيم النتائج إلى صفحات.
   * Example: ?page=2&limit=10 → يتجاوز أول 10 نتائج ويعرض التالية
   */
  paginate(): this {
    const page = this.queryString.page * 1 || 1; // الصفحة الحالية (default = 1)
    const limit = this.queryString.limit * 1 || 100; // عدد النتائج في الصفحة
    const skip = (page - 1) * limit; // عدد النتائج التي سيتم تجاوزها

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

export default APIFeatures;

/**
 * ============================================================
 * 💡 Note:
 * Why `find().find()` doesn’t execute twice:
 * - Mongoose doesn’t run the first `find()` immediately.
 * - It just merges the filter conditions into one single query.
 * ============================================================
 */
