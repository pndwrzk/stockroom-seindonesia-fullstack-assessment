import { Product } from "@prisma/client";
import { ApiError } from "../../utils/ApiError";
import {
  CreateProductDto,
  ListProductQuery,
  UpdateProductDto,
} from "./product.interface";
import { productRepository } from "./product.repository";

const getOrFail = async (id: string): Promise<Product> => {
  const product = await productRepository.findById(id);
  if (!product) throw new ApiError(404, "Product not found");
  return product;
};

const assertSkuAvailable = async (sku: string, exceptId?: string) => {
  const existing = await productRepository.findBySku(sku);
  if (existing && existing.id !== exceptId) {
    throw new ApiError(409, `SKU "${sku}" already exists`);
  }
};

export const productService = {
  async count() {
    return { total: await productRepository.count() };
  },

  async create(dto: CreateProductDto): Promise<Product> {
    await assertSkuAvailable(dto.sku);
    return productRepository.create(dto);
  },

  async findAll(query: ListProductQuery) {
    const { items, total } = await productRepository.findAll(query);
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

  findById: (id: string): Promise<Product> => getOrFail(id),

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    await getOrFail(id);
    if (dto.sku) await assertSkuAvailable(dto.sku, id);
    return productRepository.update(id, dto);
  },

  async remove(id: string): Promise<void> {
    await getOrFail(id);
    await productRepository.delete(id);
  },
};
