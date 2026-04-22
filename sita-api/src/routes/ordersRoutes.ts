import {Router} from 'express';
import * as orderController from "../controllers/orderController";
import { upload } from '../config/multer';

const router = Router();
router.post("/", upload.single("screenshot") , orderController.createOrder);
router.post("/checkout", orderController.checkStockAndGetOrderDetails);

export default router;