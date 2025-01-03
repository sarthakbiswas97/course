import prisma from "../lib/prisma";
import { Request, Response } from "express";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const allCourses = await prisma.course.findMany({
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
        purchasedBy: {
          select: {
            id: true
          }
        }
      },
    });

    res.status(200).json({
      total_courses: allCourses.length,
      courses: allCourses,
      currentUser: {
        id: req.userId,
        role: req.role
      }
    });
  } catch (error) {
    console.error("Error fetching all courses:", error);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

export const getCoursesByUser = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const userRole = req.role;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        createdCourses: userRole === "ADMIN" ? {
          include: {
            author: {
              select: {
                username: true
              }
            }
          }
        } : false,
        purchasedCourses: {
          include: {
            author: {
              select: {
                username: true
              }
            }
          }
        }
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Only sending created courses if user is admin
    res.status(200).json({
      createdCourses: userRole === "ADMIN" ? user.createdCourses : [],
      purchasedCourses: user.purchasedCourses
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

export const deleteCourse = async (req: Request, res: Response) => {
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

    const courseToDelete = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      include: {
        purchasedBy: true
      }
    });

    if (!courseToDelete) {
      res.status(404).json({
        message: "Course not found",
      });
      return;
    }

    if (courseToDelete.thumbnail) {
      const key = courseToDelete.thumbnail.split('.com/')[1];
      await s3Client.send(new DeleteObjectCommand({
        Bucket: "course-selling-app-storage",
        Key: key
      }));
    }

    if (userId != courseToDelete.authorId) {
      res.status(403).json({
        message: "Course belongs to other author",
      });
      return;
    }

    const deletedCourse = await prisma.course.delete({
      where: {
        id: courseId,
      },
    });

    res.status(200).json({
      courseId: deletedCourse.id,
      message: `${deletedCourse.title} deleted by ${username}`,
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ error: "Failed to delete course" });
  }
};

export const getCourseById = async (req: Request, res: Response) => {
  try {
    const courseId = req.params.courseId;

    if (!courseId) {
      res.status(400).json({
        message: "Course ID is required"
      });
      return;
    }

    const course = await prisma.course.findUnique({
      where: {
        id: courseId
      },
      include: {
        author: {
          select: {
            username: true
          }
        },
        purchasedBy: {
          select: {
            id: true
          }
        }
      }
    });

    if (!course) {
      res.status(404).json({
        message: "Course not found"
      });
      return;
    }

    res.status(200).json(course);
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({
      message: "Failed to fetch course"
    });
  }
};