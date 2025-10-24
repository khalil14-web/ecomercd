import { Request, Response, NextFunction } from "express"; 
import { User } from "../models/userModel";             // استيراد نموذج User
import { catchError } from "../utils/catchError";      
import { createEntitiy, deleteEntitiy, getAllEntitiy, getEntitiy, updateEntitiy } from "./factoryController"; 
import mongoose from "mongoose";                        // لاستعمال ObjectId

// === CRUD جاهزة للمستخدمين باستخدام factory ===
export const getAllUsers = getAllEntitiy(User);
export const getUser = getEntitiy(User);
export const createUser = createEntitiy(User);
export const updateUser = updateEntitiy(User);
export const deleteUser = deleteEntitiy(User);

// === إضافة منتج لعربة التسوق ===
export const addToCart = catchError(async (req: Request | any, res: Response, next: NextFunction) => {
  const user = req.user;               // المستخدم الحالي
  const { productId, newCount } = req.body;

  // التحقق إذا كان المنتج موجود بالفعل في العربة
  const cartItem = user.cart.find((p: any) => p?.productId?.toString() === productId);

  if (cartItem) {
    // إذا موجود مسبقاً، تحديث الكمية
    user.cart = user.cart.map((c: any) => 
      (c.productId.toString() === productId ? { ...c, quantity: newCount } : c)
    );
  } else {
    // إذا غير موجود، إضافته بكمية 1
    user.cart.push({ productId: new mongoose.Types.ObjectId(productId), quantity: 1 });
  }

  await user.save(); // حفظ التغييرات

  res.status(200).json({ data: { user: user }, status: "success", message: "Product added to cart" });
});

// === إزالة منتج من العربة ===
//@ts-ignore
export const removeFromCart = catchError(async (req: Request | any, res: Response, next: NextFunction) => {
  const user = req.user;
  const { productId, newCount } = req.body;

  const cartItem = user.cart.find((c: any) => c.productId.toString() === productId);

  if (!cartItem) {
    return res.status(404).json({ status: "error", message: "Product not found in cart" });
  }

  if (cartItem.quantity > 1) {
    // تقليل الكمية حسب newCount
    user.cart = user.cart.map((c: any) =>
      c.productId.toString() === productId ? { productId: c.productId, quantity: newCount } : c
    );
  } else {
    // إزالة العنصر تماماً إذا كانت الكمية 1
    user.cart = user.cart.filter((c: any) => c.productId.toString() !== productId);
  }

  await user.save();

  res.status(200).json({ data: { user }, status: "success", message: "Product removed from cart" });
});
