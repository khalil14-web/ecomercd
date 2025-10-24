import { Request, Response, NextFunction } from "express"; // استيراد أنواع Express للـ TypeScript
import { Product } from "../models";                     // استيراد نموذج Product من الموديلات
import { catchError } from "../utils/catchError";       // دالة لالتقاط الأخطاء في الـ async functions
import { getAllEntitiy, getEntitiy, createEntitiy, updateEntitiy, deleteEntitiy } from "./factoryController"; // دوال CRUD عامة
import AppError from "../utils/AppError";               // كلاس مخصص لإنشاء رسائل خطأ مخصصة

// === استخدام الـ factory functions لإنشاء دوال CRUD جاهزة ===
export const createProduct = createEntitiy(Product); // إنشاء منتج جديد
export const getProduct = getEntitiy(Product);       // جلب منتج واحد حسب الـ id
export const getAllProducts = getAllEntitiy(Product); // جلب كل المنتجات مع دعم الفلترة والبحث
export const updateProduct = updateEntitiy(Product); // تحديث منتج
export const deleteProduct = deleteEntitiy(Product); // حذف منتج

// === إضافة Variant جديد داخل مصفوفة variants للمنتج ===
export const addNewVariant = catchError(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id; // الحصول على id المنتج من الـ URL params

  // استخدام $push لإضافة عنصر جديد إلى المصفوفة variants
  const product = await Product.findByIdAndUpdate(
    id, 
    { $push: { variants: req.body } }, // إضافة العنصر الجديد من body الطلب
    {
      runValidators: true, // تشغيل قواعد التحقق من صحة البيانات (validators)
      new: true,           // إرجاع المستند بعد التحديث وليس قبل
    }
  );

  if (!product) return next(new AppError("No product found with this id", 404)); // إذا لم يوجد المنتج
  // إرجاع المنتج المحدث مع رسالة نجاح
  res.status(200).json({ data: { product }, message: "variant added successfully to the product  !" });
});

// === تحديث Variant محدد داخل مصفوفة variants ===
export const updateVariant = catchError(async (req: Request, res: Response, next: NextFunction) => {
  const { id, variantId } = req.params; // id للمنتج و variantId للمتغير داخل المصفوفة

  const updatedProduct = await Product.findOneAndUpdate(
    { _id: id, "variants._id": variantId }, // شرط العثور: المنتج يحتوي على هذا الـ variant
    { $set: { "variants.$": req.body } },   // استبدال العنصر المطابق بالكامل بالقيمة الجديدة
    { runValidators: true, new: true }      // تشغيل validators وإرجاع المستند الجديد
  );

  if (!updatedProduct) return next(new AppError("No product or variant found with this ID", 404));

  // إرجاع المنتج المحدث مع رسالة نجاح
  res.status(200).json({
    data: { product: updatedProduct },
    message: "Variant updated successfully!",
  });
});

// === حذف Variant من مصفوفة variants ===
export const deleteVariant = catchError(async (req: Request, res: Response, next: NextFunction) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { $pull: { variants: { _id: req.params.variantId } } }, // إزالة العنصر الذي يطابق _id
    { new: true } // إرجاع المستند بعد التحديث
  );

  if (!product) return next(new AppError("No product found with this id", 404));
  // ملاحظة: عادة 204 لا يُرسل body، لكن هنا أرسل رسالة
  res.status(204).json({ message: "succsessfully deleted", data: { product } });
});
