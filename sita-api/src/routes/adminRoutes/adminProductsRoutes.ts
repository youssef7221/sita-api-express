import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { validate } from "../../middleware/validateMiddleware";
import {
    ChangeProductActivitySchema,
    CreateProductsSchema,
    UpdateProductsSchema,
} from "../../dtos/product/productsDto";
import * as productsController from "../../controllers/productsController";

const router = Router();

router.use(authMiddleware);

router.post("/", validate(CreateProductsSchema), productsController.createProduct);
router.put("/:id", validate(UpdateProductsSchema), productsController.updateProduct);
router.patch("/:id/activity", validate(ChangeProductActivitySchema), productsController.changeProductActivity);
router.delete("/:id", productsController.deleteProduct);

export default router;
