import { Router } from "express";
import { ROLES } from "../../constants/roles";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { stockOpnameController } from "./stock-opname.controller";
import {
  createStockOpnameSchema,
  listStockOpnameItemsQuerySchema,
  listStockOpnameQuerySchema,
  reviewStockOpnameSchema,
  stockOpnameIdParamSchema,
  submitStockOpnameItemsSchema,
} from "./stock-opname.validation";

const router = Router();

router.get("/count", stockOpnameController.countByStatus);

router
  .route("/")
  .get(validate({ query: listStockOpnameQuerySchema }), stockOpnameController.findAll)
  .post(
    authorize(ROLES.OWNER, ROLES.MANAGER),
    validate({ body: createStockOpnameSchema }),
    stockOpnameController.initiate
  );

router.get(
  "/:id/item",
  validate({
    params: stockOpnameIdParamSchema,
    query: listStockOpnameItemsQuerySchema,
  }),
  stockOpnameController.findItems,
);

router.patch(
  "/:id/items/submit",
   authorize(ROLES.STAFF),
  validate({
    params: stockOpnameIdParamSchema,
    body: submitStockOpnameItemsSchema,
  }),
  stockOpnameController.submitItems,
);

router.post(
  "/:id/approve",
  authorize(ROLES.OWNER, ROLES.MANAGER),
  validate({
    params: stockOpnameIdParamSchema,
    body: reviewStockOpnameSchema,
  }),
  stockOpnameController.approve,
);

router.post(
  "/:id/reject",
  authorize(ROLES.OWNER, ROLES.MANAGER),
  validate({
    params: stockOpnameIdParamSchema,
    body: reviewStockOpnameSchema,
  }),
  stockOpnameController.reject,
);

router.get(
  "/:id",
  validate({ params: stockOpnameIdParamSchema }),
  stockOpnameController.findById
);

router.delete(
  "/:id",
  authorize(ROLES.OWNER),
  validate({ params: stockOpnameIdParamSchema }),
  stockOpnameController.remove,
);

export default router;