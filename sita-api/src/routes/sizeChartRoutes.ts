import { Router } from "express";
import * as sizeChartController from "../controllers/sizeChartController";

const router = Router();

router.get("/:productId/size-chart", sizeChartController.getSizeChartByProductId);

export default router;
