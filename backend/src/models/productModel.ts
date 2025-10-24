import { Schema, model, Document, Types } from "mongoose";

// واجهات Variants داخل المنتج
interface IVariantOption {
  name: string; // مثل اللون
  value: string; // مثل الأحمر
}

interface IVariant {
  options: IVariantOption[];
  images: { secure_url: string; publicId: string }[];
  price: number;
  quantity: number;
}

// واجهة المنتج
interface IProduct extends Document {
  name: string;
  description: string;
  images: { secure_url: string; publicId: string }[];
  variants: IVariant[];
  price: number;
  discount: number;
  category: Types.ObjectId;
  shortDesc: string;
}

// Schema للمنتج
const productSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  description: { type: String, required: true, min: 10 },
  images: [
    { secure_url: { type: String, required: true }, publicId: { type: String, required: true } }
  ],
  variants: [
    {
      options: [{ name: String, value: String }],
      images: [
        { secure_url: { type: String, required: true }, publicId: { type: String, required: true } }
      ],
      price: { type: Number, required: true },
      inventory: { type: Number, required: true },
    }
  ],
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  category: { type: Schema.Types.ObjectId, ref: "Category" },
  shortDesc: { type: String },
});

// قبل كل find، عمل populate للـ category
productSchema.pre(/^find/, function (next) {
  //@ts-ignore
  this.populate("category");
  next();
});

export const Product = model<IProduct>("Product", productSchema);
