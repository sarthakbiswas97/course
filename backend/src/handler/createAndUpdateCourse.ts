import prisma from "../../lib/prisma";
import { Request, Response } from "express";

interface CourseDetails {
  title: string;
  description: string;
  price: string;
  thumbnail?: string;
}

export const createCourse = async (req: Request, res: Response) => {
  try {
    const { title, description, price ,thumbnail }: CourseDetails = req.body;
    const userId = req.userId;
    const role = req.role;

    if (role !== "ADMIN") {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    if (!title || !description || !price) {
      res.status(400).json({ error: "Missing fields" });
      return;
    }

    const courseCreated = await prisma.courses.create({
      data: {
        title,
        description,
        price: price,
        thumbnail: thumbnail || undefined,
        author: {
          connect: {
            id: userId
          }
        }
      },
      include: {
        author: {
          select: {
            username: true,
          },
        },
      },
    });

    res.status(201).json(courseCreated);
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ error: "Failed to create course" });
  }
};

export const updateCourse = async (req: Request, res: Response) => {
  try {
    const role = req.role;
    const userId = req.userId;
    const username = req.username;
    const courseId = req.params.courseId;

    if (role !== "ADMIN") {
      res.status(403).json({
        message: "Access denied",
      });
      return;
    }

    if (!courseId) {
      res.status(400).json({
        message: "Course ID required",
      });
      return;
    }

    const courseToUpdate = await prisma.courses.findUnique({
      where: {
        id: courseId,
      },
      include: {
        purchasedBy: true
      }
    });

    if (!courseToUpdate) {
      res.status(404).json({
        message: "Course not found",
      });
      return;
    }

    if (userId != courseToUpdate.authorId) {
      res.status(403).json({
        message: "Course belongs to other author",
      });
      return;
    }

    const { title, description, price } = req.body;

    if (!title && !description && !price) {
      res.status(400).json({
        message: "Field required for update",
      });
      return;
    }

    const updateData = {
      ...(title && { title }),
      ...(description && { description }),
      ...(price && {price})
    };

    const updatedCourse = await prisma.courses.update({
      where: { id: courseId },
      data: updateData,
    });

    res.status(200).json({
      message: `Course updated successfully by ${username}`,
      course: updatedCourse,
    });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ error: "Failed to update course" });
  }
};