import { Document, model, Schema } from "mongoose";

// تعريف واجهة Variant مع TypeScript
interface IVariant extends Document {
  name: string;       // اسم الـ Variant مثل "Color" أو "Size"
  options: string[];  // القيم المتاحة مثل ["Red", "Blue"]
}

// تعريف الـ Schema الخاص بالـ Variant
const variantTypeSchema = new Schema<IVariant>(
  {
    name: { type: String, required: true, unique: true }, // الاسم مطلوب وفريد
    options: [{ type: String, required: true }],          // قائمة الخيارات المطلوبة
  },
  { timestamps: true } // إضافة createdAt و updatedAt تلقائياً
);

// إنشاء الموديل لتصديره واستخدامه
export const Variant = model<IVariant>("Variant", variantTypeSchema);
