import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { validate } from "../../middleware/validateMiddleware";
import { CreateProductSizeSchema, UpdateProductSizeSchema } from "../../dtos/product/productSizeDto";
import * as productSizeController from "../../controllers/productSizeController";

const router = Router();

router.use(authMiddleware);

router.post("/:productId/sizes", validate(CreateProductSizeSchema), productSizeController.addProductSize);
router.put("/:productId/sizes/:sizeId", validate(UpdateProductSizeSchema), productSizeController.updateProductSize);
router.delete("/:productId/sizes/:sizeId", productSizeController.deleteProductSize);

export default router;
