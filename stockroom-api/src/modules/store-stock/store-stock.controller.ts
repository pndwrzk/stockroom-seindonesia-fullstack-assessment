import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendSuccess } from "../../utils/response";
import { ListStoreStockQuery } from "./store-stock.interface";
import { storeStockService } from "./store-stock.service";

export const storeStockController = {
  create: catchAsync(async (req: Request, res: Response) => {
    const stock = await storeStockService.create(req.user!!, req.body);
    sendSuccess(res, stock, "Store stock created", 201);
  }),

  findAll: catchAsync(async (req: Request, res: Response) => {
    const { items, meta } = await storeStockService.findAll(
      req.user!!,
      req.query as unknown as ListStoreStockQuery,
    );
    sendSuccess(res, items, "Store stocks retrieved", 200, meta);
  }),

  findById: catchAsync(async (req: Request, res: Response) => {
    const stock = await storeStockService.findById(req.params.id as string);
    sendSuccess(res, stock, "Store stock retrieved");
  }),

  remove: catchAsync(async (req: Request, res: Response) => {
    await storeStockService.remove(req.params.id as string);
    sendSuccess(res, null, "Store stock deleted");
  }),
};
