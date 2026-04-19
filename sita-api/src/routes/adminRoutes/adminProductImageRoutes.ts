import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { upload } from "../../config/multer";
import { validate } from "../../middleware/validateMiddleware";
import { UploadProductImagesSchema } from "../../dtos/product/productImageDto";
import * as productImageController from "../../controllers/productImageController";

const router = Router();

router.use(authMiddleware);

router.post(
    "/:productId/images",
    upload.array("images"),
    validate(UploadProductImagesSchema),
    productImageController.uploadProductImages
);

router.delete("/:productId/images/:imageId", productImageController.deleteProductImage);

export default router;
