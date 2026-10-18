import { Router } from "express";
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
  .post(validate({ body: createProductSchema }), productController.create);

router
  .route("/:id")
  .get(validate({ params: productIdParamSchema }), productController.findById)
  .patch(
    validate({ params: productIdParamSchema, body: updateProductSchema }),
    productController.update
  )
  .delete(validate({ params: productIdParamSchema }), productController.remove);

export default router;