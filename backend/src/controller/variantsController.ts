import { Variant } from "../models/VariantModel";  // استيراد نموذج Variant
import { createEntitiy, deleteEntitiy, getAllEntitiy, getEntitiy, updateEntitiy } from "./factoryController"; 

// === استخدام الـ factory functions لإنشاء CRUD جاهزة ===
export const createVariant = createEntitiy(Variant); // إنشاء Variant
export const getVariant = getEntitiy(Variant);       // جلب Variant واحد
export const getAllVariants = getAllEntitiy(Variant);// جلب كل Variants
export const updateVariant = updateEntitiy(Variant); // تحديث Variant
export const deleteVariant = deleteEntitiy(Variant); // حذف Variant
