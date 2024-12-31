import { Router } from "express";
import { createPaymentOrder, verifyPayment } from "../handler/razorpay";
import { authenticateToken } from "../middleware/authenticate";

const router = Router();

// token middleware pending

router.post("/payment/create-order",createPaymentOrder)
router.post("/payment/verify",verifyPayment)

export default router;