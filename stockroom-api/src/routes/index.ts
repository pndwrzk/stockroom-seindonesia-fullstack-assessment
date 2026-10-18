import { Router } from "express";
import storeRoutes from "../modules/store/store.route";
import userRoutes from "../modules/user/user.route";
import authRoutes from "../modules/auth/auth.route";
import storeStockRoutes from "../modules/store-stock/store-stock.route";
import { ROLES } from "../constants/roles";
import productRoutes from "../modules/product/product.route";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import stockOpnameRoutes from "../modules/stock-opname/stock-opname.route";


const router = Router();

router.use("/auth", authRoutes);
router.use("/stores", authenticate,storeRoutes);
router.use("/products",authenticate, productRoutes);
router.use("/users",authenticate, userRoutes);
router.use("/store-stocks", authenticate, storeStockRoutes);
router.use("/stock-opnames", authenticate, stockOpnameRoutes);


export default router;
