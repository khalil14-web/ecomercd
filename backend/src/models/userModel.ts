import { Document, model, Schema } from "mongoose";
import bcrypt from "bcrypt";

// تعريف واجهة المستخدم مع كل الحقول والدوال
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  passwordChangeAt: Date;
  role: "user" | "admin";
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  passwordConfirm: string;
  isAdmin: boolean;
  refreshToken: string;
  age: number;
  comparePassword(password: string): Promise<boolean>; // دالة لمقارنة الباسورد
  changedPasswordAfter(JWTTimestamp: number): boolean; // تحقق هل غير الباسورد بعد إنشاء JWT
  image: { secure_url: string; publicId: string };
  cart: { productId: Schema.Types.ObjectId; quantity: number }[];
}

// تعريف Schema
const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false }, // لا يتم جلبه تلقائياً
    createdAt: { type: Date, default: Date.now },
    passwordChangeAt: { type: Date },
    isAdmin: { type: Boolean, default: false },
    refreshToken: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    active: { type: Boolean, default: true },
    age: { type: Number },
    image: { secure_url: { type: String }, publicId: { type: String } },
    cart: [{ productId: { type: Schema.Types.ObjectId, ref: "Product" }, quantity: Number }],
  },
  { timestamps: true }
);

// قبل حفظ المستخدم، تشفير الباسورد إذا تم تغييره
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// دالة لمقارنة الباسورد عند تسجيل الدخول
userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

export const User = model<IUser>("User", userSchema);
