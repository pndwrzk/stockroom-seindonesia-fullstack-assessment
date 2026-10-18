import { Router } from "express";
import { ROLES } from "../../constants/roles";
import { authorize } from "../../middlewares/auth.middleware";
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
  .post(
    authorize(ROLES.OWNER),
    validate({ body: createStoreSchema }),
    storeController.create,
  );

router
  .route("/:id")
  .get(validate({ params: storeIdParamSchema }), storeController.findById)
  .patch(
    authorize(ROLES.OWNER),
    validate({ params: storeIdParamSchema, body: updateStoreSchema }),
    storeController.update,
  )
  .delete(
    authorize(ROLES.OWNER),
    validate({ params: storeIdParamSchema }),
    storeController.remove,
  );

export default router;
