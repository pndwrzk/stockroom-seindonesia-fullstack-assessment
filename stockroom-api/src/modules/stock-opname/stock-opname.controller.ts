import { Request, Response } from "express";
import { OPNAME_STATUS } from "../../constants/stock-opname";
import { catchAsync } from "../../utils/catchAsync";
import { sendSuccess } from "../../utils/response";
import {
  ListStockOpnameItemsQuery,
  ListStockOpnameQuery,
  ReviewStockOpnameDto,
  SubmitStockOpnameItemsDto,
} from "./stock-opname.interface";
import { stockOpnameService } from "./stock-opname.service";

export const stockOpnameController = {
  countByStatus: catchAsync(async (req: Request, res: Response) => {
    const counts = await stockOpnameService.countByStatus(req.user!!);
    sendSuccess(res, counts, "Stock opname counts retrieved");
  }),

  initiate: catchAsync(async (req: Request, res: Response) => {
    const opname = await stockOpnameService.initiate(req.user!!, req.body);
    sendSuccess(res, opname, "Stock opname initiated", 201);
  }),

  findAll: catchAsync(async (req: Request, res: Response) => {
    const { items, meta } = await stockOpnameService.findAll(
      req.user!!,
      req.query as unknown as ListStockOpnameQuery
    );
    sendSuccess(res, items, "Stock opnames retrieved", 200, meta);
  }),

  findById: catchAsync(async (req: Request, res: Response) => {
    const opname = await stockOpnameService.findById(req.user!!, req.params.id as string);
    sendSuccess(res, opname, "Stock opname retrieved");
  }),

  remove: catchAsync(async (req: Request, res: Response) => {
    await stockOpnameService.remove(req.params.id as string);
    sendSuccess(res, null, "Stock opname deleted");
  }),

  findItems: catchAsync(async (req: Request, res: Response) => {
    const { items, meta } = await stockOpnameService.findItems(
      req.user!!,
      req.params.id as string,
      req.query as unknown as ListStockOpnameItemsQuery,
    );
    sendSuccess(res, items, "Stock opname items retrieved", 200, meta);
  }),

  submitItems: catchAsync(async (req: Request, res: Response) => {
    const result = await stockOpnameService.submitItems(
      req.user!!,
      req.params.id as string,
      req.body as SubmitStockOpnameItemsDto,
    );
    sendSuccess(res, result, "Stock opname items submitted");
  }),

  approve: catchAsync(async (req: Request, res: Response) => {
    const opname = await stockOpnameService.review(
      req.user!!,
      req.params.id as string,
      OPNAME_STATUS.APPROVED,
      req.body as ReviewStockOpnameDto,
    );
    sendSuccess(res, opname, "Stock opname approved");
  }),

  reject: catchAsync(async (req: Request, res: Response) => {
    const opname = await stockOpnameService.review(
      req.user!!,
      req.params.id as string,
      OPNAME_STATUS.REJECTED,
      req.body as ReviewStockOpnameDto,
    );
    sendSuccess(res, opname, "Stock opname rejected");
  }),
};