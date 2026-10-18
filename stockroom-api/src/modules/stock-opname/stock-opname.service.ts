import { ROLES } from "../../constants/roles";
import { OPNAME_SCOPE, OPNAME_STATUS } from "../../constants/stock-opname";
import { AuthUser } from "../../types/auth";
import { ApiError } from "../../utils/ApiError";
import { storeStockRepository } from "../store-stock/store-stock.repository";
import { storeRepository } from "../store/store.repository";
import {
  CreateStockOpnameDto,
  ListStockOpnameItemsQuery,
  ListStockOpnameQuery,
  ReviewStockOpnameDto,
  SubmitStockOpnameItemsDto,
} from "./stock-opname.interface";
import {
  stockOpnameRepository,
  StockOpnameDetail,
  StockOpnameItem,
  StockOpnameResponse,
  StockOpnameTransactionRepository,
} from "./stock-opname.repository";

const assertCanSubmit = (status: number): void => {
  if (
    status !== OPNAME_STATUS.INITIATED &&
    status !== OPNAME_STATUS.IN_PROGRESS &&
    status !== OPNAME_STATUS.REJECTED
  ) {
    throw new ApiError(409, "Stock opname is not accepting counted quantities");
  }
};

const assertCanAccessStore = (actor: AuthUser, storeId: string): void => {
  if (actor.role !== ROLES.OWNER && actor.storeId !== storeId) {
    throw new ApiError(
      403,
      "You are not authorized to access this stock opname",
    );
  }
};

const assertItemsBelongToOpname = async (
  repository: StockOpnameTransactionRepository,
  stockOpnameId: string,
  productIds: string[],
): Promise<void> => {
  const existingProductIds = new Set(
    await repository.findItemProductIds(stockOpnameId, productIds),
  );
  const invalidProductIds = productIds.filter(
    (productId) => !existingProductIds.has(productId),
  );
  if (invalidProductIds.length > 0) {
    throw new ApiError(
      422,
      "Some products do not belong to this stock opname",
      { productIds: invalidProductIds },
    );
  }
};

export const stockOpnameService = {
  async countByStatus(actor: AuthUser) {
    let storeId: string | undefined;
    if (actor.role === ROLES.MANAGER || actor.role === ROLES.STAFF) {
      if (!actor.storeId) {
        throw new ApiError(403, "Your account is not assigned to a store");
      }
      storeId = actor.storeId;
    }

    const counts = await stockOpnameRepository.countByStatus(storeId);
    const totalsByStatus = new Map(
      counts.map(({ status, total }) => [status, total]),
    );
    return Object.values(OPNAME_STATUS).map((status) => ({
      status,
      total: totalsByStatus.get(status) ?? 0,
    }));
  },

  async initiate(
    actor: AuthUser,
    dto: CreateStockOpnameDto,
  ): Promise<StockOpnameDetail> {
    if (actor.role === ROLES.MANAGER) {
      if (!actor.storeId || actor.storeId !== dto.storeId) {
        throw new ApiError(
          403,
          "You are not authorized to initiate stock opname for this store",
        );
      }
    }

    const storeId = dto.storeId;
    const store = await storeRepository.findById(storeId);
    if (!store) throw new ApiError(404, "Store not found");

    const active = await stockOpnameRepository.findActiveByStore(storeId);
    if (active)
      throw new ApiError(409, "This store already has an active stock opname");

    const isAll = dto.scope === OPNAME_SCOPE.ALL;
    const stocks = await storeStockRepository.findQuantities(
      storeId,
      isAll ? undefined : dto.productIds,
    );

    if (isAll) {
      if (stocks.length === 0)
        throw new ApiError(422, "This store has no stock to count");
    } else {
      const found = new Set(stocks.map((s) => s.productId));
      const missing = (dto.productIds ?? []).filter((id) => !found.has(id));
      if (missing.length > 0) {
        throw new ApiError(
          422,
          "Some products have no stock record in this store",
          {
            productIds: missing,
          },
        );
      }
    }

    return stockOpnameRepository.create({
      sessionNumber: `${store.code}-${new Date()
        .toISOString()
        .replace(/[-:.]/g, "")}`,
      storeId,
      scope: dto.scope,
      note: dto.note,
      initiatedBy: actor.id,
      items: stocks.map((s) => ({
        productId: s.productId,
        systemQty: s.quantity,
      })),
    });
  },

  async findAll(actor: AuthUser, query: ListStockOpnameQuery) {
    let storeId;
    if (actor.role === ROLES.MANAGER || actor.role === ROLES.STAFF) {
      if (!actor.storeId) {
        throw new ApiError(403, "You are not authorized to view stock opname");
      }
      storeId = actor.storeId;
    }

    if (actor.role !== ROLES.OWNER && !storeId) {
      throw new ApiError(403, "Your account is not assigned to a store");
    }

    const { items, total } = await stockOpnameRepository.findAll({
      ...query,
      storeId,
    });
    return {
      items: items.map(({ _count, ...item }) => ({
        ...item,
        total: _count.items,
      })),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  },

  async findById(actor: AuthUser, id: string): Promise<StockOpnameResponse> {
    const opname = await stockOpnameRepository.findById(id);
    if (!opname) throw new ApiError(404, "Stock opname not found");
    return opname;
  },

  async remove(id: string): Promise<void> {
    const opname = await stockOpnameRepository.findStatusById(id);
    if (!opname) throw new ApiError(404, "Stock opname not found");

    const canRemove = opname.status !== OPNAME_STATUS.APPROVED
    if (!canRemove) {
      throw new ApiError(
        409,
        "Approved stock opname cannot be deleted",
      );
    }

    const deleted = await stockOpnameRepository.delete(id);
    if (!deleted) throw new ApiError(404, "Stock opname not found");
  },

  async findItems(
    actor: AuthUser,
    id: string,
    query: ListStockOpnameItemsQuery,
  ): Promise<{
    items: StockOpnameItem[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const opname = await stockOpnameRepository.findStoreIdById(id);
    if (!opname) throw new ApiError(404, "Stock opname not found");
    const { items, total } = await stockOpnameRepository.findItems(
      id,
      query.page,
      query.limit,
    );
    return {
      items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  },

  async submitItems(
    actor: AuthUser,
    id: string,
    dto: SubmitStockOpnameItemsDto,
  ) {
    return stockOpnameRepository.transaction(async (repository) => {
      const opname = await repository.findForSubmit(id);
      if (!opname) throw new ApiError(404, "Stock opname not found");
      assertCanAccessStore(actor, opname.storeId);
      assertCanSubmit(opname.status);
      await assertItemsBelongToOpname(
        repository,
        id,
        dto.items.map((item) => item.productId),
      );

      await repository.updateCountedQuantities(id, dto.items);
      let status = opname.status;
      let noteRecorded = false;
      if (status !== OPNAME_STATUS.IN_PROGRESS) {
        const updated = await repository.updateStatus(
          id,
          status,
          OPNAME_STATUS.IN_PROGRESS,
        );
        if (!updated) {
          throw new ApiError(409, "Stock opname status changed; please retry");
        }
        await repository.createHistory({
          opnameId: id,
          fromStatus: status,
          toStatus: OPNAME_STATUS.IN_PROGRESS,
          userId: actor.id,
          note: dto.note,
        });
        noteRecorded = dto.note !== undefined;
        status = OPNAME_STATUS.IN_PROGRESS;
      }

      const remainingCount = await repository.countUncountedItems(id);
      if (remainingCount === 0) {
        const updated = await repository.updateStatus(
          id,
          OPNAME_STATUS.IN_PROGRESS,
          OPNAME_STATUS.SUBMITTED,
        );
        if (!updated) {
          throw new ApiError(409, "Stock opname status changed; please retry");
        }
        await repository.createHistory({
          opnameId: id,
          fromStatus: OPNAME_STATUS.IN_PROGRESS,
          toStatus: OPNAME_STATUS.SUBMITTED,
          userId: actor.id,
          note: noteRecorded ? undefined : dto.note,
        });
        noteRecorded = noteRecorded || dto.note !== undefined;
        status = OPNAME_STATUS.SUBMITTED;
      }

      if (dto.note !== undefined && !noteRecorded) {
        await repository.createHistory({
          opnameId: id,
          fromStatus: status,
          toStatus: status,
          userId: actor.id,
          note: dto.note,
        });
      }

      return {
        status,
        submittedCount: dto.items.length,
        remainingCount,
      };
    });
  },

  async review(
    actor: AuthUser,
    id: string,
    status: typeof OPNAME_STATUS.APPROVED | typeof OPNAME_STATUS.REJECTED,
    dto: ReviewStockOpnameDto,
  ): Promise<StockOpnameResponse> {
    await stockOpnameRepository.transaction(async (repository) => {
      const opname = await repository.findForReview(id);
      if (!opname) throw new ApiError(404, "Stock opname not found");
      if (actor.role === ROLES.MANAGER && actor.storeId !== opname.storeId) {
        throw new ApiError(
          403,
          "You are not authorized to review this stock opname",
        );
      }
      if (opname.status !== OPNAME_STATUS.SUBMITTED) {
        throw new ApiError(409, "Only submitted stock opname can be reviewed");
      }

      let countedItems: { productId: string; countedQty: number }[] = [];
      if (status === OPNAME_STATUS.APPROVED) {
        countedItems = opname.items.filter(
          (item): item is { productId: string; countedQty: number } =>
            item.countedQty !== null,
        );
        if (countedItems.length !== opname.items.length) {
          throw new ApiError(
            409,
            "Cannot approve stock opname while some products have not been counted",
          );
        }

        const existingStockIds = new Set(
          await repository.findStoreStockProductIds(
            opname.storeId,
            countedItems.map((item) => item.productId),
          ),
        );
        const missingStockIds = countedItems
          .filter((item) => !existingStockIds.has(item.productId))
          .map((item) => item.productId);
        if (missingStockIds.length > 0) {
          throw new ApiError(409, "Store stock records are missing", {
            productIds: missingStockIds,
          });
        }
      }

      const transitioned = await repository.updateStatus(
        id,
        OPNAME_STATUS.SUBMITTED,
        status,
      );
      if (!transitioned) {
        throw new ApiError(409, "Only submitted stock opname can be reviewed");
      }

      if (status === OPNAME_STATUS.APPROVED) {
        for (const item of countedItems) {
          const updateCount = await repository.updateStoreStockQuantity(
            opname.storeId,
            item.productId,
            item.countedQty,
          );
          if (updateCount !== 1) {
            throw new ApiError(
              409,
              "Store stock records changed; please retry",
            );
          }
        }
      }

      await repository.createHistory({
        opnameId: id,
        fromStatus: OPNAME_STATUS.SUBMITTED,
        toStatus: status,
        userId: actor.id,
        note: dto.note,
      });
    });

    const reviewedOpname = await stockOpnameRepository.findById(id);
    if (!reviewedOpname) throw new ApiError(404, "Stock opname not found");
    return reviewedOpname;
  },
};
