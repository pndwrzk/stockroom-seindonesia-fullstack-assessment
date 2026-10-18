import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware";
import { storeController } from "./store.controller";
import {
  createStoreSchema,
  listStoreQuerySchema,
  storeIdParamSchema,
  updateStoreSchema,
} from "./store.validation";

const router = Router();

router.get("/count", storeController.count);

router
  .route("/")
  .get(validate({ query: listStoreQuerySchema }), storeController.findAll)
  .post(validate({ body: createStoreSchema }), storeController.create);

router
  .route("/:id")
  .get(validate({ params: storeIdParamSchema }), storeController.findById)
  .patch(
    validate({ params: storeIdParamSchema, body: updateStoreSchema }),
    storeController.update,
  )
  .delete(validate({ params: storeIdParamSchema }), storeController.remove);

export default router;
