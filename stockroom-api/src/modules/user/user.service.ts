import { ROLES, Role } from "../../constants/roles";
import { storeRepository } from "../store/store.repository";
import { ApiError } from "../../utils/ApiError";
import { hashPassword } from "../../utils/password";
import { CreateUserDto, ListUserQuery, UpdateUserDto } from "./user.interface";
import { userRepository, UserWithStore } from "./user.repository";
import { AuthUser } from "../../types/auth";

const getOrFail = async (id: string): Promise<UserWithStore> => {
  const user = await userRepository.findById(id);
  if (!user) throw new ApiError(404, "User not found");
  return user;
};

const assertNikAvailable = async (nik: string, exceptId?: string) => {
  const existing = await userRepository.findByNik(nik);
  if (existing && existing.id !== exceptId) {
    throw new ApiError(409, `NIK "${nik}" already exists`);
  }
};

const assertUsernameAvailable = async (username: string, exceptId?: string) => {
  const existing = await userRepository.findByUsernameSafe(username);
  if (existing && existing.id !== exceptId) {
    throw new ApiError(409, `Username "${username}" already exists`);
  }
};

const assertRoleStoreRule = async (role: Role, storeId: string | null, exceptUserId?: string) => {
  if (role === ROLES.OWNER) {
    if (storeId) throw new ApiError(422, "OWNER must not be assigned to a store");
    return;
  }

  if (!storeId) throw new ApiError(422, "storeId is required for MANAGER and STAFF");

  const store = await storeRepository.findById(storeId);
  if (!store) throw new ApiError(404, "Store not found");

  if (role === ROLES.MANAGER) {
    const manager = await userRepository.findManagerByStore(storeId, exceptUserId);
    if (manager) throw new ApiError(409, "This store already has a manager");
  }
};

export const userService = {
  async count(actor: AuthUser) {
    let storeId: string | undefined;
    if (actor.role === ROLES.MANAGER || actor.role === ROLES.STAFF) {
      if (!actor.storeId) {
        throw new ApiError(403, "You are not authorized to view users");
      }
      storeId = actor.storeId;
    }
    return { total: await userRepository.count(storeId) };
  },

  async create(actor: AuthUser, dto: CreateUserDto): Promise<UserWithStore> {
    if (actor.role === ROLES.MANAGER) {
      if (!actor.storeId || actor.storeId !== dto.storeId) {
        throw new ApiError(403, "You are not authorized to create user for this store");
      }
    }

    await assertNikAvailable(dto.nik);
    await assertUsernameAvailable(dto.username);
    await assertRoleStoreRule(dto.role, dto.storeId ?? null);

    const password = await hashPassword(dto.password);
    return userRepository.create({ ...dto, password });
  },

  async findAll(actor: AuthUser, query: ListUserQuery) {

    if (actor.role === ROLES.MANAGER || actor.role === ROLES.STAFF) {
      if (!actor.storeId) {
        throw new ApiError(403, "You are not authorized to view users");
      }
      query.storeId = actor.storeId;
    }
    
    const { items, total } = await userRepository.findAll(query);
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

  findById: (id: string): Promise<UserWithStore> => getOrFail(id),

  async update(id: string, dto: UpdateUserDto): Promise<UserWithStore> {
    const current = await getOrFail(id);

    if (dto.nik) await assertNikAvailable(dto.nik, id);
    if (dto.username) await assertUsernameAvailable(dto.username, id);

    const role = (dto.role ?? current.role) as Role;
    const storeId = dto.storeId !== undefined ? dto.storeId : current.storeId;
    await assertRoleStoreRule(role, storeId, id);

    const { password, ...rest } = dto;
    const data: UpdateUserDto = {
      ...rest,
      ...(password && { password: await hashPassword(password) }),
      ...(role === ROLES.OWNER && { storeId: null }),
    };

    return userRepository.update(id, data);
  },

  async remove(id: string): Promise<void> {
    const user = await getOrFail(id);
    if (user.role === ROLES.OWNER) {
      throw new ApiError(422, "OWNER cannot be deleted");
    }
    await userRepository.delete(id);
  },
};