import { Router } from "express";
import * as governoratesController from "../controllers/governoratesController";

const router = Router();

router.get("/", governoratesController.getAllGovernRates);
router.get("/:id", governoratesController.getGovernRateById);

export default router;