import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { validate } from "../../middleware/validateMiddleware";
import { CreateProductDiscountSchema, UpdateProductDiscountSchema } from "../../dtos/product/productDiscountDto";
import * as productDiscountController from "../../controllers/productDiscountController";

const router = Router();

router.use(authMiddleware);

router.get("/product-discounts", productDiscountController.getAllProductDiscounts);
router.get("/product-discounts/:id", productDiscountController.getProductDiscountById);
router.get("/products/:productId/discounts", productDiscountController.getProductDiscountsByProductId);
router.post("/product-discounts", validate(CreateProductDiscountSchema), productDiscountController.createProductDiscount);
router.put("/product-discounts/:id", validate(UpdateProductDiscountSchema), productDiscountController.updateProductDiscount);
router.patch("/product-discounts/:id/toggle", productDiscountController.toggleProductDiscount);
router.delete("/product-discounts/:id", productDiscountController.deleteProductDiscount);

export default router;
