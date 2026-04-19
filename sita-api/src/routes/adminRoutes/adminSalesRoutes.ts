import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { validate } from "../../middleware/validateMiddleware";
import { CreateSaleSchema, UpdateSaleSchema } from "../../dtos/sales/salesDto";
import * as salesController from "../../controllers/salesController";

const router = Router();

router.use(authMiddleware);

router.get("/", salesController.getAllSales);
router.get("/:id", salesController.getSaleById);
router.post("/", validate(CreateSaleSchema), salesController.createSale);
router.put("/:id", validate(UpdateSaleSchema), salesController.updateSale);
router.delete("/:id", salesController.deleteSale);

export default router;
