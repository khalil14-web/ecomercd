import { Order } from "../models";
import { 
  createEntitiy, 
  deleteEntitiy, 
  getAllEntitiy, 
  getEntitiy, 
  updateEntitiy 
} from "./factoryController";

/**
 * 🧾 Create new order
 * إنشاء طلب جديد في قاعدة البيانات
 * يعتمد على الـ factory function العامة createEntitiy()
 */
export const createOrder = createEntitiy(Order);

/**
 * 🔍 Get one order by ID
 * جلب طلب واحد باستخدام الـ ID
 */
export const getOrder = getEntitiy(Order);

/**
 * 📋 Get all orders
 * جلب جميع الطلبات المسجلة في قاعدة البيانات
 */
export const getAllOrders = getAllEntitiy(Order);

/**
 * ✏️ Update order
 * تعديل بيانات طلب معين عبر الـ ID
 */
export const updateOrder = updateEntitiy(Order);

/**
 * ❌ Delete order
 * حذف طلب معين من قاعدة البيانات
 */
export const deleteOrder = deleteEntitiy(Order);
