import { z } from "zod";
import { createStoreSchema, listStoreQuerySchema, updateStoreSchema } from "./store.validation";

export type CreateStoreDto = z.infer<typeof createStoreSchema>;
export type UpdateStoreDto = z.infer<typeof updateStoreSchema>;
export type ListStoreQuery = z.infer<typeof listStoreQuerySchema>;