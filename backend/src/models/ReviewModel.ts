import { Schema, model, Document, Types } from "mongoose";

// واجهة Review
interface IReview extends Document {
  user: Types.ObjectId;    // المستخدم الذي كتب المراجعة
  product: Types.ObjectId; // المنتج الذي تمت مراجعته
  rating: number;          // تقييم من 1 إلى 5
  title: string;           // عنوان المراجعة
  comment: string;         // نص المراجعة
  isVerifiedPurchase: boolean; // هل الشراء تم فعلياً
  helpfulVotes: number;    // عدد الأصوات المفيدة
  images?: string[];       // صور المراجعة اختياري
}

// تعريف الـ Schema
const reviewSchema = new Schema<IReview>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true },
    comment: { type: String, required: true },
    isVerifiedPurchase: { type: Boolean, default: false },
    helpfulVotes: { type: Number, default: 0 },
    images: [String],
  },
  { timestamps: true }
);

export const Review = model<IReview>("Review", reviewSchema);
