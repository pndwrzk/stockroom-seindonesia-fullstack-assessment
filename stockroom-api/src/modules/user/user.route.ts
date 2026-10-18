import { Router } from "express";
import { ROLES } from "../../constants/roles";
import { authorize } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { userController } from "./user.controller";
import {
  createUserSchema,
  listUserQuerySchema,
  updateUserSchema,
  userIdParamSchema,
} from "./user.validation";

const router = Router();

router.get("/count", userController.count);

router
  .route("/")
  .get(validate({ query: listUserQuerySchema }), userController.findAll)
  .post(
    authorize(ROLES.OWNER, ROLES.MANAGER),
    validate({ body: createUserSchema }),
    userController.create,
  );

router
  .route("/:id")
  .get(validate({ params: userIdParamSchema }), userController.findById)
  .patch(validate({ params: userIdParamSchema, body: updateUserSchema }), userController.update)
  .delete(validate({ params: userIdParamSchema }), userController.remove);

export default router;