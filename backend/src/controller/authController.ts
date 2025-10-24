// ============================================================
// 🔐 AUTH CONTROLLER
// ============================================================
// This file handles all authentication-related operations:
// - Register, Login, Logout
// - Token generation (JWT & Refresh Token)
// - Access protection & Admin authorization

import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction, CookieOptions } from "express";
import AppError from "../utils/AppError";
import { IUser, User } from "../models/userModel";
import { catchError } from "../utils/catchError";

// ============================================================
// ⏱️ Token Expiration Settings
// ============================================================
// Short lifetime for access tokens to improve security
const JWT_EXPIRES = "10m"; // مدة صلاحية access token قصيرة (10 دقائق)
// Longer lifetime for refresh tokens (can renew access tokens)
const REFRESH_TOKEN_EXPIRES = "7d"; // مدة صلاحية refresh token أسبوع

// ============================================================
// 🎫 Generate JWT Token
// ============================================================
// Creates a JWT using the user's ID as payload
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: JWT_EXPIRES,
  });
};

// ============================================================
// 🍪 Cookie Configuration
// ============================================================
// Defines settings for storing the refresh token in the browser
const cookieOptions: CookieOptions = {
  expires: new Date(Date.now() + 3000 * 60 * 60), // تنتهي بعد ساعة واحدة
  httpOnly: true, // يمنع الوصول إلى الكوكي من JS (حماية من XSS)
  sameSite: "strict", // يمنع إرسال الكوكي مع الطلبات الخارجية
  secure: process.env.NODE_ENV === "production", // يستخدم فقط عبر HTTPS في الإنتاج
};

// ============================================================
// 📤 Send JWT + Refresh Token to Client
// ============================================================
// Generates tokens, stores refresh token in DB & cookie, then sends response
const sendResponse = async (res: Response, user: any, code: number): Promise<void> => {
  const token = generateToken(user._id); // إنشاء access token
  const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN as string, {
    expiresIn: REFRESH_TOKEN_EXPIRES,
  });

  // Ensure cookie is secure in production mode
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  // Store refresh token in the database
  const updated = await User.findByIdAndUpdate(user._id, { refreshToken });
  console.log(updated, "Updated"); // تأكيد عملية التحديث في الـ console

  // Attach refresh token as cookie
  res.cookie("jwt", refreshToken, cookieOptions);

  // Remove password field from user object before sending
  user.password = undefined;

  // Send success response with tokens
  res.status(code).json({ status: "success", token, data: { user } });
};

// ============================================================
// 🧍 REGISTER
// ============================================================
// Creates a new user and sends tokens immediately
export const register = catchError(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const newUser = await User.create({ ...req.body }); // إنشاء مستخدم جديد من البيانات
  sendResponse(res, newUser, 201); // إرسال الرد مع التوكن
});

// ============================================================
// 🔑 LOGIN
// ============================================================
// Authenticates user by verifying email & password
export const login = catchError(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) return next(new AppError("Please provide email and password", 400));

  // Find user and include password (since it's excluded by default in schema)
  const user = await User.findOne({ email }).select("+password");

  // Verify user existence and password validity
  if (!user || !(await user.comparePassword(password))) return next(new AppError("Incorrect email or password", 401));

  // Send response with tokens
  sendResponse(res, user, 200);
});

// ============================================================
// 🧱 CHECK IF ADMIN
// ============================================================
// Middleware to ensure the logged-in user has admin privileges
export const checkIfAdmin = catchError(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //@ts-ignore
  const { user } = req;
  console.log(user);

  if (user.role !== "admin") return next(new AppError("You are not an admin", 403));
  else next(); // Continue if admin
});

// ============================================================
// 🛡️ PROTECT (Access Guard)
// ============================================================
// Verifies JWT token and attaches the user to req.user
interface IDecoded {
  id: string;
  iat: number;
}

export const protect = catchError(
  async (
    req: Request extends { user: IUser } ? Request & { user: IUser } : Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    let token = "";

    // Extract token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // If no token found → block access
    if (!token) return next(new AppError("You are not logged in. Please log in to get access", 401));
    console.log(token);

    // Verify token using JWT secret
    const decoded: IDecoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload extends {
      id: string;
      iat: number;
    }
      ? JwtPayload
      : never;

    console.log(decoded);

    // Check if user associated with token still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) return next(new AppError("The user belonging to this token does no longer exist", 401));

    //@ts-ignore
    req.user = currentUser; // Attach user to request
    next(); // Proceed to next middleware
  }
);

// ============================================================
// ♻️ REFRESH TOKEN
// ============================================================
// Issues new access token if refresh token is valid
export const refresh = catchError(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const refreshToken = req.cookies.jwt;
  console.log(refreshToken);

  if (!refreshToken) return next(new AppError("You are not logged in. Please log in to get access", 401));

  // Verify refresh token validity
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN as string, async (err: any, decoded: any) => {
    if (err) return next(new AppError("Refresh token is not valid", 403));
    console.log(decoded);

    const existingUser: IUser | null = await User.findById(decoded.id);
    console.log(existingUser);

    if (!existingUser) return next(new AppError("Refresh token is not valid", 403));

    // Generate a new access token
    const token = generateToken(existingUser._id as string);
    return res.status(200).json({ status: "success", token, data: { user: existingUser } });
  });
});

// ============================================================
// 🚪 LOGOUT
// ============================================================
// Removes refresh token from DB and clears cookie
export const logout = catchError(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  // If no cookie → nothing to log out
  if (!req.cookies.jwt) {
    return res.status(204).json({ status: "success" });
  }

  const refreshToken: string = req.cookies.jwt;

  // Find user with this refresh token
  const user = await User.findOne({ refreshToken });

  // If no user found → clear cookie anyway
  if (!user) {
    res.clearCookie("jwt", cookieOptions);
    return res.status(204).json({ status: "success" });
  }

  // Remove refresh token from user
  user.refreshToken = "";
  await user.save();

  // Clear cookie from client
  res.clearCookie("jwt", cookieOptions);
  return res.status(200).json({ status: "success" });
});
