import prisma from "../../lib/prisma";
import { Request, Response } from "express";

export const buyCourse = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const courseId = req.params.courseId;

    if (!courseId) {
      res.status(400).json({
        message: "Course ID required",
      });
      return;
    }

    const courseToBuy = await prisma.courses.findUnique({
      where: {
        id: courseId,
      },
      include: {
        purchasedBy: true
      }
    });

    if (!courseToBuy) {
      res.status(404).json({
        message: "Course not found",
      });
      return;
    }

    if (userId === courseToBuy.authorId) {
      res.status(403).json({
        message: "Users cannot buy their own courses",
      });
      return;
    }

    const alreadyPurchased = courseToBuy.purchasedBy.some(user => user.id === userId);
    if (alreadyPurchased) {
      res.status(400).json({
        message: "Course already purchased",
      });
      return;
    }

    const purchase = await prisma.courses.update({
      where: {
        id: courseId,
      },
      data: {
        purchasedBy: {
          connect: {
            id: userId
          }
        }
      },
      include: {
        author: {
          select: {
            username: true
          }
        }
      }
    });

    res.status(200).json({
      message: `Course ${courseToBuy.title} purchased successfully`,
      course: purchase
    });
  } catch (error) {
    console.error("Error purchasing course:", error);
    res.status(500).json({ error: "Failed to purchase course" });
  }
};