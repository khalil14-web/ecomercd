import express from "express";
import {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  addNewVariant,
  updateVariant,
  deleteVariant,
} from "../controller/productController";

const router = express.Router();

//! 🔹 جميع المنتجات
router.route("/")
  .get(getAllProducts)   //! ✅ جلب جميع المنتجات
  .post(createProduct);  //! ✅ إنشاء منتج جديد

//! 🔹 منتج واحد عبر الـ ID
router.route("/:id")
  .get(getProduct)       //! ✅ جلب منتج محدد
  .patch(updateProduct)  //! ✅ تحديث منتج محدد
  .delete(deleteProduct);//! ✅ حذف منتج محدد

//! 🔹 التعامل مع الـ variants داخل المنتج
router.route("/:id/variants")
  .post(addNewVariant); //! ✅ إضافة variant جديد

router.route("/:id/variants/:variantId")
  .patch(updateVariant) //! ✅ تحديث variant معين
  .delete(deleteVariant); //! ✅ حذف variant معين

export const productRouter = router;
