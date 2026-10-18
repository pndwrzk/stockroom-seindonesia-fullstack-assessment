import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";

interface Schemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

export const validate = (schemas: Schemas) => (req: Request, _res: Response, next: NextFunction) => {
  try {
    if (schemas.body) req.body = schemas.body.parse(req.body);
    if (schemas.params) req.params = schemas.params.parse(req.params) as typeof req.params;
    if (schemas.query) {
      const parsed = schemas.query.parse(req.query);
      Object.defineProperty(req, "query", { value: parsed, writable: true });
    }
    next();
  } catch (err) {
    next(err);
  }
};