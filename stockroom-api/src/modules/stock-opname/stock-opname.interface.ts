import { z } from "zod";
import {
  createStockOpnameSchema,
  listStockOpnameItemsQuerySchema,
  listStockOpnameQuerySchema,
  reviewStockOpnameSchema,
  submitStockOpnameItemsSchema,
} from "./stock-opname.validation";

export type CreateStockOpnameDto = z.infer<typeof createStockOpnameSchema>;
export type ListStockOpnameQuery = z.infer<typeof listStockOpnameQuerySchema>;
export type ListStockOpnameItemsQuery = z.infer<typeof listStockOpnameItemsQuerySchema>;
export type SubmitStockOpnameItemsDto = z.infer<typeof submitStockOpnameItemsSchema>;
export type ReviewStockOpnameDto = z.infer<typeof reviewStockOpnameSchema>;