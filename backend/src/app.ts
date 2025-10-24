/**
 * ==============================
 * 🌐 Express App Configuration
 * ==============================
 * This file initializes the Express application,
 * applies global middlewares for security, logging, and data parsing,
 * and sets up all API routes and error handling.
 */

import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import cookieParser from "cookie-parser";
import cors from "cors";

// 🧩 Models & Utilities
import { User } from "./models/userModel";
import globalErrorHandler from "./controller/errorController";
import AppError from "./utils/AppError";
import corsOptions from "../config/corsOptions";

// 🧭 Routers
import { userRouter } from "./routes/userRouter";
import { authRouter } from "./routes/authRouter";
import { productRouter } from "./routes/productRouter";
import { CategoryRouter } from "./routes/categoryRouter";
import { VariantRouter } from "./routes/variantsRouter";
import { OrderRouter } from "./routes/orderRouter";

const app = express();

/* ======================================================
   🧱 GLOBAL MIDDLEWARES (Applied to every incoming request)
   ====================================================== */

// 🛡️ Security Headers (prevents common web vulnerabilities)
app.use(helmet());

// 🧾 HTTP Request Logger (different levels for prod/dev)
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// 📦 Parse JSON requests (limit 10kb to prevent DoS attacks)
app.use(express.json({ limit: "10kb" }));

// 📄 Parse form-urlencoded requests (simple objects only)
app.use(express.urlencoded({ extended: false }));

// 🍪 Parse cookies (useful for authentication/session)
app.use(cookieParser());

// 🔒 Prevent NoSQL injection (removes $ and . from inputs)
app.use(mongoSanitize());

// ⚔️ Prevent XSS attacks (cleans user input from malicious scripts)
app.use(xss());

// 🌍 Enable Cross-Origin Resource Sharing (frontend ↔ backend)
//@ts-ignore
app.use(cors(corsOptions));

// 🧭 Simple Logger (shows requested URL in console)
app.use((req, res, next) => {
  console.log("📥 Request URL:", req.url);
  next();
});

/* ================================
   🚏 ROUTES (API Endpoints setup)
   ================================ */
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/products", productRouter);
app.use("/categories", CategoryRouter);
app.use("/variants", VariantRouter);
app.use("/orders", OrderRouter);

/**
 * 🚫 Handle undefined routes
 * Triggered when no matching route is found.
 */
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

/* ===========================================
   ⚠️ GLOBAL ERROR HANDLER (final middleware)
   ===========================================
   Catches and formats all errors thrown by:
   - Controllers
   - Routers
   - Unhandled async operations
*/
app.use(globalErrorHandler);

export default app;
