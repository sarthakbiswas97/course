import { Router } from "express";
import { getsignedUrl,putSignedUrl } from "../handler/signedUrl";
import { authenticateToken } from "../middleware/authenticate";

const router = Router();

router.post("/get-signed-url",authenticateToken,getsignedUrl)
router.post("/put-signed-url",authenticateToken,putSignedUrl)

export default router;