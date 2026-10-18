import { ROLES } from "../../constants/roles";
import { AuthUser } from "../../types/auth";
import { ApiError } from "../../utils/ApiError";
import { productRepository } from "../product/product.repository";
import { storeRepository } from "../store/store.repository";
import {
  CreateStoreStockDto,
  ListStoreStockQuery,
} from "./store-stock.interface";
import {
  storeStockRepository,
  StoreStockDetail,
} from "./store-stock.repository";

const getOrFail = async (id: string): Promise<StoreStockDetail> => {
  const stock = await storeStockRepository.findById(id);
  if (!stock) throw new ApiError(404, "Store stock not found");
  return stock;
};

export const storeStockService = {
  async create( actor: AuthUser,dto: CreateStoreStockDto): Promise<StoreStockDetail> {
    if(actor.role === ROLES.MANAGER){
        if(!actor.storeId || actor.storeId !== dto.storeId){
            throw new ApiError(403, "You are not authorized to create store stock for this store");
        }
    }

    const [store, product] = await Promise.all([
      storeRepository.findById(dto.storeId),
      productRepository.findById(dto.productId),
    ]);
    if (!store) throw new ApiError(404, "Store not found");
    if (!product) throw new ApiError(404, "Product not found");

    const existing = await storeStockRepository.findByStoreAndProduct(
      dto.storeId,
      dto.productId,
    );
    if (existing) {
      throw new ApiError(
        409,
        "Stock for this product already exists in this store",
      );
    }

    return storeStockRepository.create(dto);
  },

  async findAll(actor: AuthUser,query: ListStoreStockQuery) {
    if(actor.role === ROLES.STAFF || actor.role === ROLES.MANAGER){
       if(!actor.storeId){
          throw new ApiError(403, "You are not authorized to view store stock");
       }
       query.storeId = actor.storeId;
    }
    const { items, total } = await storeStockRepository.findAll(query);
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

  findById: (id: string): Promise<StoreStockDetail> => getOrFail(id),

  async remove(id: string): Promise<void> {
    await getOrFail(id);
    await storeStockRepository.delete(id);
  },
};
