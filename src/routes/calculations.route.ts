import { Router } from "express";
import { calculationAlgoholValue } from "../controllers/calculations.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();
router.use(authenticateToken);
router.get("/analysis/:val", calculationAlgoholValue);

export default router;
