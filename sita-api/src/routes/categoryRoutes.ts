import { Router } from "express";
import * as categoriesController from "../controllers/categoriesController";

const router = Router();

router.get("/", categoriesController.getAllCategories);
router.get("/:id", categoriesController.getCategoryById);

const categoryRoutes = router;
export default categoryRoutes;