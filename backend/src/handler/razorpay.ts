import Razorpay from "razorpay";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils";
import prisma from "../lib/prisma";
import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const KEY_ID = process.env.KEY_ID || "";
const KEY_SECRET = process.env.KEY_SECRET || "";
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "";

const instance = new Razorpay({
  key_id: KEY_ID,
  key_secret: KEY_SECRET,
});

export const createPaymentOrder = async (req: Request, res: Response) => {
  try {
    const { amount, courseId } = req.body;
    const userId = req.userId;

    const order = await prisma?.$transaction(async (tx: Prisma.TransactionClient) => {
      const course = await tx.course.findUnique({
        where: {
          id: courseId,
        },
        include: {
          purchasedBy: true,
        },
      });

      if (!course || !course.purchasedBy.some((user: { id: string }) => user.id === userId)) {
        throw new Error(`Course unavailable or already purchased`);
      }

      const options = {
        amount: Number(amount),
        currency: "INR",
        receipt: `order_${Date.now()}`,
      };

      const razorpayOrder = await instance.orders.create(options);

      const dbOrder = await tx.order.create({
        data: {
          id: razorpayOrder.id,
          userId,
          courseId,
          status: "PENDING",
        },
      });

      return { razorpayOrder, dbOrder };
    });

    res.status(200).json(order?.razorpayOrder);
  } catch (error) {
    res.status(500).json({ error: "Failed to create order" });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const webhookSignature = req.headers["x-razorpay-signature"] as string;

    const isValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      WEBHOOK_SECRET
    );

    if (!isValid) {
      throw new Error("Invalid Signature");
    }

    const { event, payload } = req.body;
    const payment = payload.payment.entity;

    await prisma?.$transaction(async (tx: Prisma.TransactionClient) => {
      const order = await tx.order.findUnique({
        where: { id: payment.order_id },
      });
      if (!order) throw new Error("Order not found");

      if (event === "payment.captured") {
        await tx.purchaseDetails.create({
          data: {
            order_id: payment.order_id,
            amount: (payment.amount / 100).toString(),
            payment_id: payment.id,
          },
        });

        await tx.order.update({
          where: {
            id: payment.order_id,
          },
          data: {
            status: "COMPLETED",
          },
        });

        await tx.course.update({
          where: {
            id: order.courseId,
          },
          data: {
            purchasedBy: {
              connect: {
                id: order.userId,
              },
            },
          },
        });
      } else if (event === "payment.failed") {
        await tx.order.update({
          where: { id: payment.order_id },
          data: { status: "FAILED" },
        });
      }
    });

    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
};