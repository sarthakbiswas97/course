import Razorpay from "razorpay";
import { Request, Response } from "express";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const KEY_ID = process.env.KEY_ID || "";
const KEY_SECRET = process.env.KEY_SECRET || "";

const instance = new Razorpay({
  key_id: KEY_ID,
  key_secret: KEY_SECRET,
});

export const createPaymentOrder = async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: Number(amount),
      currency: "INR",
      receipt: `order_${Date.now()}`,
    };

    const order = await instance.orders.create(options);

    if (!order) {
      res.status(500).send("Some error occured");
      return;
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).send(error);
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { id, razorpay_payment_id, razorpay_signature } = req.body;

    const hmac = crypto.createHmac("sha256", KEY_SECRET);

    hmac.update(`${id}|${razorpay_payment_id}`);

    const generatedSignature = hmac.digest("hex");

    console.log(`HMAC`, hmac);
    console.log(`generatedSignature`, generatedSignature);

    if (generatedSignature === razorpay_signature) {
      res.status(200).json({
        message: "Payment verified successfully",
      });
      return
    } else {
      res.status(400).json({
        message: "Payment verification failed",
      });
      return
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
    return
  }
};

