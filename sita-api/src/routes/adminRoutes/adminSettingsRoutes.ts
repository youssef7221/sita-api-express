import { Router } from "express";
import { validate } from "../../middleware/validateMiddleware";
import * as settingsController from "../../controllers/settingsController";
import { UpdateSettingSchema } from "../../dtos/settings/settingsDto";
import { authMiddleware } from "../../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.get("/:key", settingsController.getSettingByKey);
router.put("/:key", validate(UpdateSettingSchema), settingsController.updateSetting);

export default router;