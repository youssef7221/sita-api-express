import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { upload } from "../../config/multer";
import * as sizeChartController from "../../controllers/sizeChartController";

const router = Router();

router.use(authMiddleware);

router.post("/:productId/size-chart", upload.single("chart"), sizeChartController.createSizeChart);
router.put("/:productId/size-chart", upload.single("chart"), sizeChartController.updateSizeChart);
router.delete("/:productId/size-chart", sizeChartController.deleteSizeChart);

export default router;
