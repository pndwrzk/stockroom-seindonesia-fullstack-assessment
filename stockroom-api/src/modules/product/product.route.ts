import { Router } from "express";
import { ROLES } from "../../constants/roles";
import { authorize } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { productController } from "./product.controller";
import {
  createProductSchema,
  listProductQuerySchema,
  productIdParamSchema,
  updateProductSchema,
} from "./product.validation";

const router = Router();

router.get("/count", productController.count);

router
  .route("/")
  .get(validate({ query: listProductQuerySchema }), productController.findAll)
  .post(
    authorize(ROLES.OWNER),
    validate({ body: createProductSchema }),
    productController.create,
  );

router
  .route("/:id")
  .get(validate({ params: productIdParamSchema }), productController.findById)
  .patch(
    authorize(ROLES.OWNER),
    validate({ params: productIdParamSchema, body: updateProductSchema }),
    productController.update
  )
  .delete(
    authorize(ROLES.OWNER),
    validate({ params: productIdParamSchema }),
    productController.remove
  );

export default router;