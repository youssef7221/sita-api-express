import { Router } from "express";
import * as productsController from "../controllers/productsController";

const router = Router();

router.get("/", productsController.getProducts);
router.get("/category/:categoryId", productsController.getProductsByCategoryId);
router.get("/:id", productsController.getProductById);

export default router;
