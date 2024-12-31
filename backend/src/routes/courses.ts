import { Router } from "express";
import { buyCourse } from "../handler/buyCourses";
import { createCourse, updateCourse } from "../handler/createAndUpdateCourse";
import { deleteCourse, getAllCourses, getCourseById, getCoursesByUser } from "../handler/readAndDeleteCourse";
import { authenticateToken } from "../middleware/authenticate";

const router = Router();

//create new course
router.post("/createcourse", authenticateToken, createCourse);

//get all listed courses
router.get("/courses", authenticateToken, getAllCourses);

//get courses by author/user
router.get("/courses-by-user", authenticateToken, getCoursesByUser);

//delete course by admin/author
router.delete("/delete-course/:courseId", authenticateToken, deleteCourse);

//update course by admin/author
router.put("/update-course/:courseId", authenticateToken, updateCourse);

//buy course
router.post("/buy-course/:courseId", authenticateToken, buyCourse);

//get individual course
router.get("/course/:courseId", authenticateToken, getCourseById);


export default router;
