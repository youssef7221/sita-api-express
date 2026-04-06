import { Router } from "express";
import * as governoratesController from "../../controllers/governoratesController";
import { authMiddleware } from "../../middleware/authMiddleware";
import { validate } from "../../middleware/validateMiddleware";
import { UpdateGovernorateSchema } from "../../dtos/goveronorates/goveronoratesDto";

const router = Router();

router.use(authMiddleware);

router.put("/:id",validate(UpdateGovernorateSchema), governoratesController.updateGovernRate);

export default router;