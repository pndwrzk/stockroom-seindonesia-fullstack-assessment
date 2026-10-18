import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendSuccess } from "../../utils/response";
import { ListUserQuery } from "./user.interface";
import { userService } from "./user.service";

export const userController = {
  count: catchAsync(async (req: Request, res: Response) => {
    const result = await userService.count(req.user!!);
    sendSuccess(res, result, "Users count retrieved");
  }),

  create: catchAsync(async (req: Request, res: Response) => {
    const user = await userService.create(req.user!!,req.body);
    sendSuccess(res, user, "User created", 201);
  }),

  findAll: catchAsync(async (req: Request, res: Response) => {
    const { items, meta } = await userService.findAll(req.user!!, req.query as unknown as ListUserQuery);
    sendSuccess(res, items, "Users retrieved", 200, meta);
  }),

  findById: catchAsync(async (req: Request, res: Response) => {
    const user = await userService.findById(req.params.id as string);
    sendSuccess(res, user, "User retrieved");
  }),

  update: catchAsync(async (req: Request, res: Response) => {
    const user = await userService.update(req.params.id as string, req.body);
    sendSuccess(res, user, "User updated");
  }),

  remove: catchAsync(async (req: Request, res: Response) => {
    await userService.remove(req.params.id as string);
    sendSuccess(res, null, "User deleted");
  }),
};