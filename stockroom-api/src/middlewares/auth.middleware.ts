import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { verifyAccessToken } from "../utils/token";
import { AuthUser } from "../types/auth";

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new ApiError(401, "Missing or malformed Authorization header"));
  }

  try {
    req.user = verifyAccessToken(header.slice(7)) as AuthUser;
    next();
  } catch {
    next(new ApiError(401, "Invalid or expired access token"));
  }
};

export const authorize =
  (...roles: number[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new ApiError(401, "Unauthenticated"));
    if (!roles.includes(req.user.role)) return next(new ApiError(403, "Forbidden"));
    next();
  };