import { z } from "zod";
import { stockOpnameStatus } from "@/features/stock-opname/constants/stock-opname-status";
import type { StockOpnameStatus } from "@/features/stock-opname/constants/stock-opname-status";

export const stockOpnameStatusSchema = z.union([
  z.literal(stockOpnameStatus.INITIATED),
  z.literal(stockOpnameStatus.IN_PROGRESS),
  z.literal(stockOpnameStatus.SUBMITTED),
  z.literal(stockOpnameStatus.APPROVED),
  z.literal(stockOpnameStatus.REJECTED),
  z.literal(stockOpnameStatus.NEEDS_REVISION),
]);

export const stockOpnameRecordSchema = z.object({
  id: z.string(),
  sessionNumber: z.string(),
  storeId: z.string(),
  scope: z.union([z.literal(0), z.literal(1)]),
  status: stockOpnameStatusSchema,
  initiatedBy: z.string(),
  initiatedAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  store: z.object({
    id: z.string(),
    code: z.string(),
    name: z.string(),
  }),
  initiator: z.object({
    id: z.string(),
    name: z.string(),
  }),
  total: z.number().int().min(0),
});

export const stockOpnamesResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: z.array(stockOpnameRecordSchema),
    meta: z.object({
      page: z.number().int().min(1),
      limit: z.number().int().min(1),
      total: z.number().int().min(0),
      totalPages: z.number().int().min(0),
    }),
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
  }),
]);

export const deleteStockOpnameResponseSchema = z.discriminatedUnion(
  "success",
  [
    z.object({
      success: z.literal(true),
      message: z.string(),
    }),
    z.object({
      success: z.literal(false),
      message: z.string(),
    }),
  ]
);

export type StockOpnamesQuery = {
  page: number;
  limit: number;
  search?: string;
  status?: StockOpnameStatus;
};

export type StockOpnamesResponse = Extract<
  z.infer<typeof stockOpnamesResponseSchema>,
  { success: true }
>;

export type StockOpnameRecord = z.infer<typeof stockOpnameRecordSchema>;

export const stockOpnameDetailResponseSchema = z.discriminatedUnion(
  "success",
  [
    z.object({
      success: z.literal(true),
      message: z.string(),
      data: z.object({
        id: z.string(),
        sessionNumber: z.string().optional(),
        storeId: z.string(),
        scope: z.union([z.literal(0), z.literal(1)]),
        status: stockOpnameStatusSchema,
        initiatedBy: z.string(),
        initiatedAt: z.string().datetime(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
        store: z.object({
          id: z.string(),
          code: z.string(),
          name: z.string(),
        }),
        initiator: z.object({
          id: z.string(),
          name: z.string(),
        }),
        histories: z.array(
          z.object({
            id: z.string(),
            fromStatus: stockOpnameStatusSchema.nullable(),
            toStatus: stockOpnameStatusSchema,
            note: z.string().nullable(),
            createdAt: z.string().datetime(),
            user: z.object({
              id: z.string(),
              name: z.string(),
            }),
          })
        ),
      }),
    }),
    z.object({
      success: z.literal(false),
      message: z.string(),
    }),
  ]
);

export const stockOpnameItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  systemQty: z.number().int().min(0),
  countedQty: z.number().int().min(0).nullable(),
  product: z.object({
    id: z.string(),
    sku: z.string(),
    name: z.string(),
    unit: z.string().optional(),
  }),
});

export const stockOpnameItemsResponseSchema = z.discriminatedUnion(
  "success",
  [
    z.object({
      success: z.literal(true),
      message: z.string(),
      data: z.array(stockOpnameItemSchema),
      meta: z.object({
        page: z.number().int().min(1),
        limit: z.number().int().min(1),
        total: z.number().int().min(0),
        totalPages: z.number().int().min(0),
      }),
    }),
    z.object({
      success: z.literal(false),
      message: z.string(),
    }),
  ]
);

export type StockOpnameDetailResponse = Extract<
  z.infer<typeof stockOpnameDetailResponseSchema>,
  { success: true }
>["data"];
export type StockOpnameDetail = StockOpnameDetailResponse;
export type StockOpnameItem = z.infer<typeof stockOpnameItemSchema>;
export type StockOpnameItemsResponse = Extract<
  z.infer<typeof stockOpnameItemsResponseSchema>,
  { success: true }
>;

export const submitStockOpnameItemsSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        countedQty: z.number().int().min(0),
      })
    )
    .min(1, "Enter a counted quantity for at least one product."),
  note: z.string().trim().optional(),
});

export type SubmitStockOpnameItemsValues = z.infer<
  typeof submitStockOpnameItemsSchema
>;

export const submitStockOpnameItemsResponseSchema = z.discriminatedUnion(
  "success",
  [
    z.object({
      success: z.literal(true),
      message: z.string(),
      data: z.object({
        status: stockOpnameStatusSchema,
        submittedCount: z.number().int().min(0),
        remainingCount: z.number().int().min(0),
      }),
    }),
    z.object({
      success: z.literal(false),
      message: z.string(),
    }),
  ]
);

export type SubmitStockOpnameItemsResult = Extract<
  z.infer<typeof submitStockOpnameItemsResponseSchema>,
  { success: true }
>["data"];

export const reviewStockOpnameSchema = z.object({
  note: z.string().trim().optional(),
});

export type ReviewStockOpnameValues = z.infer<
  typeof reviewStockOpnameSchema
>;

export const reviewStockOpnameResponseSchema = z.discriminatedUnion(
  "success",
  [
    z.object({
      success: z.literal(true),
      message: z.string(),
      data: z.object({
        id: z.string(),
        status: stockOpnameStatusSchema,
      }),
    }),
    z.object({
      success: z.literal(false),
      message: z.string(),
    }),
  ]
);

const createStockOpnameFields = {
  storeId: z.string().min(1, "Store is required."),
  note: z.string().trim().optional(),
};

export const createStockOpnameSchema = z.discriminatedUnion("scope", [
  z.object({
    ...createStockOpnameFields,
    scope: z.literal(0),
    productIds: z.array(z.string().min(1)).min(1, "Select at least one product."),
  }),
  z.object({
    ...createStockOpnameFields,
    scope: z.literal(1),
    productIds: z.array(z.string()).length(0),
  }),
]);

export type CreateStockOpnameValues = z.infer<typeof createStockOpnameSchema>;

export const createStockOpnameResponseSchema = z.discriminatedUnion(
  "success",
  [
    z.object({
      success: z.literal(true),
      message: z.string(),
      data: z.unknown().optional(),
      meta: z.unknown().optional(),
    }),
    z.object({
      success: z.literal(false),
      message: z.string(),
    }),
  ]
);
