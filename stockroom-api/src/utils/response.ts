import { Response } from "express";

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = "Success",
  statusCode = 200,
  meta?: Record<string, unknown>
) => res.status(statusCode).json({ success: true, message, data, ...(meta && { meta }) });