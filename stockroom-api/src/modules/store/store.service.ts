import { ROLES } from "../../constants/roles";
import { AuthUser } from "../../types/auth";
import { ApiError } from "../../utils/ApiError";
import { CreateStoreDto, ListStoreQuery, UpdateStoreDto } from "./store.interface";
import { storeRepository } from "./store.repository";

const getOrFail = async (id: string) => {
  const store = await storeRepository.findById(id);
  if (!store) throw new ApiError(404, "Store not found");
  return store;
};

const assertCodeAvailable = async (code: string, exceptId?: string) => {
  const existing = await storeRepository.findByCode(code);
  if (existing && existing.id !== exceptId) {
    throw new ApiError(409, `Store code "${code}" already exists`);
  }
};

export const storeService = {
  async count() {
   
    return { total: await storeRepository.count() };
  },

  async create(dto: CreateStoreDto) {
    await assertCodeAvailable(dto.code);
    return storeRepository.create(dto);
  },

  async findAll(query: ListStoreQuery) {
    const { items, total } = await storeRepository.findAll(query);
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

  findById: (id: string) => getOrFail(id),

  async update(id: string, dto: UpdateStoreDto) {
    await getOrFail(id);
    if (dto.code) await assertCodeAvailable(dto.code, id);
    return storeRepository.update(id, dto);
  },

  async remove(id: string) {
    await getOrFail(id);
    await storeRepository.delete(id);
  },
};