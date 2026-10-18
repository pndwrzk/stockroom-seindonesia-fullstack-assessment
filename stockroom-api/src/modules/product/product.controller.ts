import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendSuccess } from "../../utils/response";
import { ListProductQuery } from "./product.interface";
import { productService } from "./product.service";

export const productController = {
  count: catchAsync(async (_req: Request, res: Response) => {
    const result = await productService.count();
    sendSuccess(res, result, "Products count retrieved");
  }),

  create: catchAsync(async (req: Request, res: Response) => {
    const product = await productService.create(req.body);
    sendSuccess(res, product, "Product created", 201);
  }),

  findAll: catchAsync(async (req: Request, res: Response) => {
    const { items, meta } = await productService.findAll(req.query as unknown as ListProductQuery);
    sendSuccess(res, items, "Products retrieved", 200, meta);
  }),

  findById: catchAsync(async (req: Request, res: Response) => {
    const product = await productService.findById(req.params.id as string);
    sendSuccess(res, product, "Product retrieved");
  }),

  update: catchAsync(async (req: Request, res: Response) => {
    const product = await productService.update(req.params.id as string, req.body);
    sendSuccess(res, product, "Product updated");
  }),

  remove: catchAsync(async (req: Request, res: Response) => {
    await productService.remove(req.params.id as string);
    sendSuccess(res, null, "Product deleted");
  }),
};