import { Router } from "express";
import * as salesController from "../controllers/salesController";

const router = Router();

router.get("/active", salesController.getActiveSale);

export default router;
