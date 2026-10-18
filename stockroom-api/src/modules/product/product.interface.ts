import { z } from "zod";
import {
  createProductSchema,
  listProductQuerySchema,
  updateProductSchema,
} from "./product.validation";

export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
export type ListProductQuery = z.infer<typeof listProductQuerySchema>;