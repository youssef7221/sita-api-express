import {Router} from 'express';
import * as orderController from "../../controllers/orderController";
import { authMiddleware } from '../../middleware/authMiddleware';
import { upload } from '../../config/multer';

const router = Router();

router.use(authMiddleware);

router.get("/", orderController.getAllOrders);
router.get("/:id", orderController.getOrderById);

export default router;