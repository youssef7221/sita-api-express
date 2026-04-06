import {Router} from "express";
import { validate } from "../../../sita-api/src/middleware/validateMiddleware";
import * as adminController from "../controllers/adminController";
import {  LoginSchema, RegisterSchema } from "../dtos/auth/authDto";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", validate(RegisterSchema), adminController.createAdmin);

router.post("/login", validate(LoginSchema), adminController.loginAdmin);

router.get("/me", authMiddleware, adminController.getCurrentAdmin);

const adminsRoute = router;
export default adminsRoute;