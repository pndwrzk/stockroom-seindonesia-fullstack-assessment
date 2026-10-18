import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError";
import { env } from "../config";

export const notFound = (req: Request, _res: Response, next: NextFunction) => {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} not found`));
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let statusCode = 500;
  let message = "Internal server error";
  let details: unknown;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof ZodError) {
    statusCode = 422;
    message = "Validation error";
    details = err.issues.map((i) => ({
      path: i.path.join("."),
      message: i.message,
    }));
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = 409;
      message = "Data already exists";
      details = err.meta;
    } else if (err.code === "P2003") {
      statusCode = 409;
      message = "Data is still referenced by other records";
    } else if (err.code === "P2025") {
      statusCode = 404;
      message = "Data not found";
    }
  }

  if (statusCode === 500) console.error(err);

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { errors: details } : {}),
    ...(env.nodeEnv === "development" &&
    statusCode === 500 &&
    err instanceof Error
      ? { stack: err.stack }
      : {}),
  });
};
