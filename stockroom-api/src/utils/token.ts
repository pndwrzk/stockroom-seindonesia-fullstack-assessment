import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing env ${key}`);
  return value;
};

const ACCESS_SECRET = required("JWT_ACCESS_SECRET");
const REFRESH_SECRET = required("JWT_REFRESH_SECRET");
const ACCESS_EXPIRES = (process.env.JWT_ACCESS_EXPIRES_IN ?? "15m") as SignOptions["expiresIn"];
const REFRESH_EXPIRES = (process.env.JWT_REFRESH_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"];

export interface AuthUser {
  id: string;
  role: number;
  storeId: string | null;
}

export const signAccessToken = (user: AuthUser): string =>
  jwt.sign({ role: user.role, storeId: user.storeId }, ACCESS_SECRET, {
    subject: user.id,
    expiresIn: ACCESS_EXPIRES,
  });

export const signRefreshToken = (userId: string): string =>
  jwt.sign({}, REFRESH_SECRET, { subject: userId, expiresIn: REFRESH_EXPIRES });

export const verifyAccessToken = (token: string): AuthUser => {
  const payload = jwt.verify(token, ACCESS_SECRET) as JwtPayload;
  return { id: payload.sub as string, role: payload.role, storeId: payload.storeId ?? null };
};

export const verifyRefreshToken = (token: string): JwtPayload =>
  jwt.verify(token, REFRESH_SECRET) as JwtPayload;