import prisma from "../../lib/prisma";
import { Request, Response } from "express";

export const buyCourse = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;
    
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { purchaseDetails: true }
    });

    if (!order || order.status !== "COMPLETED") {
      throw new Error("Invalid or incomplete order");
    }

    res.status(200).json({ message: "Course purchased successfully" });
  } catch (error) {
    res.status(500).json({ message: "Course purchase Failed" });
  }
};