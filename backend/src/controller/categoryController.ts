/**
 * ============================================================
 * 🧩 Category Controller
 * ============================================================
 * الهدف (Purpose):
 * - هذا الملف يحتوي على دوال التحكم (controllers) الخاصة بكيان الفئات (Categories).
 * - يعتمد على الـ factoryController لتوليد دوال CRUD عامة (Create, Read, Update, Delete)
 *   بطريقة DRY (Don’t Repeat Yourself).
 * 
 * ✅ الفكرة:
 *   بدل ما نكرر نفس الكود لكل موديل (User, Product, Category...),
 *   نستخدم factory functions لتوليدها أوتوماتيكياً.
 */

// 🏗️ Import the Category model (الموديل الذي يمثل الفئات في قاعدة البيانات)
import { Category } from "../models";

// 🧠 Import the generic CRUD factory functions
// (دوال عامة لإدارة الكيانات)
import {
  createEntitiy,
  deleteEntitiy,
  getAllEntitiy,
  getEntitiy,
  updateEntitiy,
} from "./factoryController";

/**
 * ============================================================
 * 📚 Controllers for Category
 * ============================================================
 * كل دالة هنا عبارة عن نسخة مخصصة من الدوال العامة في factoryController
 * لكنها مرتبطة بـ Category model.
 */

// 🔹 Get all categories (جلب جميع الفئات)
export const getAllCategory = getAllEntitiy(Category);

// 🔹 Get one category by ID (جلب فئة واحدة عبر المعرف)
export const getCategory = getEntitiy(Category);

// 🔹 Create a new category (إنشاء فئة جديدة)
export const createCategory = createEntitiy(Category);

// 🔹 Update category by ID (تحديث فئة موجودة)
export const updateCategory = updateEntitiy(Category);

// 🔹 Delete category by ID (حذف فئة من القاعدة)
export const deleteCategory = deleteEntitiy(Category);
