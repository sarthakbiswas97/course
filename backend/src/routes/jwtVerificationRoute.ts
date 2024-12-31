import { Router } from "express";
import { authenticateToken } from "../handler/verifyJWT";

const router = Router();

router.get("/verify-jwt",authenticateToken)

export default router;