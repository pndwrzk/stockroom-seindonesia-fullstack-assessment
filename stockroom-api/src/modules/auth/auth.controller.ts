import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendSuccess } from "../../utils/response";
import { authService } from "./auth.service";

export const authController = {
  login: catchAsync(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    sendSuccess(res, result, "Login successful");
  }),

  getMe: catchAsync(async (req: Request, res: Response) => {
    const user = await authService.getMe(req.user?.id!!);
    sendSuccess(res, user, "User retrieved successfully");
  }),

  refresh: catchAsync(async (req: Request, res: Response) => {
    const tokens = await authService.refresh(req.body.refreshToken);
    sendSuccess(res, tokens, "Token refreshed");
  }),
};