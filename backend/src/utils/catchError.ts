import { NextFunction, Request, Response } from "express";

/**
 * ============================================================
 * 🧩 Utility: catchError (Async Error Wrapper)
 * ============================================================
 * Purpose:
 * - Simplifies error handling in async route handlers and controllers.
 *
 * Problem:
 * - In Express, errors thrown inside async functions are not caught automatically.
 * - Without this helper, you'd need repetitive try/catch blocks in every controller.
 *
 * Solution:
 * - Wraps async functions and automatically forwards any rejected Promise
 *   to Express’s global error handling middleware using `next(err)`.
 *
 * Example:
 * -------------
 * // ❌ Without catchError:
 * app.get("/user", async (req, res, next) => {
 *   try {
 *     const user = await User.findById(req.params.id);
 *     res.json(user);
 *   } catch (err) {
 *     next(err);
 *   }
 * });
 *
 * // ✅ With catchError:
 * app.get("/user", catchError(async (req, res, next) => {
 *   const user = await User.findById(req.params.id);
 *   res.json(user);
 * }));
 * -------------
 */

export const catchError = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  // Return a new async function that automatically catches rejected promises
  return async (req: Request, res: Response, next: NextFunction) => {
    // If `fn` throws or rejects, Express will pass the error to the global handler
    fn(req, res, next).catch(next);
  };
};
