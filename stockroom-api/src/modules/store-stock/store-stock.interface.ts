import { z } from "zod";
import {
  createStoreStockSchema,
  listStoreStockQuerySchema,
} from "./store-stock.validation";

export type CreateStoreStockDto = z.infer<typeof createStoreStockSchema>;
export type ListStoreStockQuery = z.infer<typeof listStoreStockQuerySchema>;