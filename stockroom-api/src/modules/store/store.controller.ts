import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendSuccess } from "../../utils/response";
import { storeService } from "./store.service";
import { ListStoreQuery } from "./store.interface";

export const storeController = {
  count: catchAsync(async (_req: Request, res: Response) => {
    const result = await storeService.count();
    sendSuccess(res, result, "Stores count retrieved");
  }),

  create: catchAsync(async (req: Request, res: Response) => {
    const store = await storeService.create(req.body);
    sendSuccess(res, store, "Store created", 201);
  }),

  findAll: catchAsync(async (req: Request, res: Response) => {
    const { items, meta } = await storeService.findAll(req.query as unknown as ListStoreQuery);
    sendSuccess(res, items, "Stores retrieved", 200, meta);
  }),

  findById: catchAsync(async (req: Request, res: Response) => {
    const store = await storeService.findById(req.params.id as string);
    sendSuccess(res, store, "Store retrieved");
  }),

  update: catchAsync(async (req: Request, res: Response) => {
    const store = await storeService.update(req.params.id as string, req.body);
    sendSuccess(res, store, "Store updated");
  }),

  remove: catchAsync(async (req: Request, res: Response) => {
    await storeService.remove(req.params.id as string);
    sendSuccess(res, null, "Store deleted");
  }),
};