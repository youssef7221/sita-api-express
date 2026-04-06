import { Router } from "express";
import { validate } from "../../middleware/validateMiddleware";
import * as categoriesController from "../../controllers/categoriesController";
import { CreateCategorySchema, UpdateCategorySchema } from "../../dtos/category/categoryDto";
import { authMiddleware } from "../../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.post("/", validate(CreateCategorySchema), categoriesController.createCategory);
router.put("/:id", validate(UpdateCategorySchema), categoriesController.updateCategory);
router.delete("/:id", categoriesController.deleteCategory);

export default router;