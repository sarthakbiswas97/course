import express,{ Router } from "express";
import { createPaymentOrder, verifyPayment } from "../handler/razorpay";
import { authenticateToken } from "../middleware/authenticate";

const router = Router();

// token middleware pending

// routes/payment.ts
router.post("/payment/create-order",authenticateToken,createPaymentOrder);
router.post('/webhook', verifyPayment);

export default router;

