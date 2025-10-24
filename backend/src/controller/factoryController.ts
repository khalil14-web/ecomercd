// 📘 استيراد الأدوات والأنواع الأساسية
import { Model, Document } from "mongoose"; // من Mongoose: Model لإنشاء عمليات CRUD و Document لتمثيل الوثائق
import AppError from "../utils/AppError"; // كائن مخصص لإنشاء أخطاء احترافية
import { catchError } from "../utils/catchError"; // دالة تغلف الدوال async لتفادي تكرار try/catch
import { Request, Response, NextFunction } from "express"; // أنواع Express للمزيد من الأمان في TypeScript
import APIFeatures from "../utils/APIFeatures"; // كلاس خاص بالتحكم في البحث، الفرز، التصفية، الترقيم...

//!   app.post("/products/:id", (req, res) => {
  //!   console.log("Params:", req.params);
 //!    console.log("Query:", req.query);
  //!   console.log("Body:", req.body);
  //!   console.log("Headers:", req.headers);
  //!   res.send("Data received");
//!   });
//!   POST /products/45?sort=price
//!   Content-Type: application/json

//!   {
 //!    "name": "iPhone",
 //!    "price": 999
//!   }
//!   Params: { id: "45" }
//!   Query: { sort: "price" }
//!   Body: { name: "iPhone", price: 999 }
//!   Headers: { content-type: "application/json", ... }

// ====================================================================
// 🔹 1. إنشاء مستند جديد (Create)
// ====================================================================
// <T extends Document> : تعريف النوع العام الذي يجب أن يكون وثيقة Mongoose
// Model: النموذج (Product, User...)
// ModelName?: اسم النموذج فقط لعرضه في الرسالة
export const createEntitiy = <T extends Document>(
  Model: Model<T>,
  ModelName?: string
) =>
  catchError(async (req: Request, res: Response, next: NextFunction) => {
    // إنشاء مستند جديد داخل قاعدة البيانات من البيانات المرسلة في body
    const doc = await Model.create(req.body);

    // إرسال رد ناجح مع الوثيقة التي تم إنشاؤها ورسالة
    res.status(200).json({
      data: { doc },
      message: `${ModelName} created successfully`,
    });
  });

// ====================================================================
// 🔹 2. جلب مستند واحد حسب الـ ID (Read One)
// ====================================================================
export const getEntitiy = <T extends Document>(Model: Model<T>) =>
  catchError(async (req: Request, res: Response, next: NextFunction) => {
    // استخراج id من الرابط مثل /products/:id
    const { id } = req.params;

    // البحث عن المستند في قاعدة البيانات
    const doc = await Model.findById(id);

    // إعادة النتيجة إلى العميل
    res.status(200).json({ data: { doc } });
  });

// ====================================================================
// 🔹 3. جلب جميع المستندات مع الفلترة والفرز والتقسيم إلى صفحات (Read All)
// ====================================================================
export const getAllEntitiy = <T extends Document>(Model: Model<T>) =>
  catchError(async (req: Request, res: Response, next: NextFunction) => {
    console.log(req);

    // إنشاء كائن APIFeatures للتحكم في الاستعلامات
    // Model.find() = استعلام أولي لجلب كل الوثائق
    // req.query = المعايير القادمة من الرابط مثل ?page=2&limit=10&sort=price
    const docs = await new APIFeatures(Model.find(), req.query)
      .paginate()     // تقسيم النتائج إلى صفحات
      .filter()       // تطبيق الفلاتر (مثل category أو السعر)
      .sort()         // ترتيب النتائج (asc/desc)
      .limitFields()  // تحديد الحقول التي ستظهر في النتائج
      .query;         // النتيجة النهائية للاستعلام بعد كل العمليات

    // حساب إجمالي عدد الوثائق لتوليد عدد الصفحات
    const totalCount = await Model.countDocuments();
    const totalPages = Math.floor(
      totalCount / (req.query.limit ? +req.query.limit : 10)
    );

    // إرسال النتيجة
    res.status(200).json({
      data: { docs },
      totalPages,
    });
  });

// ====================================================================
// 🔹 4. تعديل مستند (Update)
// ====================================================================
export const updateEntitiy = <T extends Document>(Model: Model<T>) =>
  catchError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // تحديث المستند حسب الـ id وإرجاع النسخة الجديدة {new:true}
    const doc = await Model.findByIdAndUpdate(id, req.body, { new: true });

    // إذا لم يتم العثور على الوثيقة → أرسل خطأ مخصص
    if (!doc) return next(new AppError("No document found with this id", 404));

    // رد ناجح مع الوثيقة المحدثة
    res.status(200).json({ data: { doc } });
  });

// ====================================================================
// 🔹 5. حذف مستند (Delete)
// ====================================================================
export const deleteEntitiy = <T extends Document>(Model: Model<T>) =>
  catchError(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // حذف المستند حسب الـ id
    const doc = await Model.findByIdAndDelete(id);

    // إذا لم يتم العثور عليه → أرسل خطأ
    if (!doc) return next(new AppError("No document found with this id", 404));

    // رد نجاح بسيط
    res.status(200).json({ message: "Successfully deleted" });
  });
