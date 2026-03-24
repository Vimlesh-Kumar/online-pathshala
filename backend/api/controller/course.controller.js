import * as courseServices from '../services/course.service.js';
import * as enrollmentServices from '../services/enrollment.services.js';

export const addCourse = async (req, res) => {
    try {
        const body = req.body;
        const result = await courseServices.addCourseInDB(body);
        
        const enrollmentDetails = {
            course_id: result.insertId,
            user_id: req.user.id
        };
        
        await enrollmentServices.enrolling(enrollmentDetails);
        
        return res.status(200).json({
            data: result,
            message: "Course added successfully and enrolled."
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Unable to insert course details."
        });
    }
};

export const allcourseByUserId = async (req, res) => {
    try {
        const id = req.user.id;
        const courses = await courseServices.courseByUserId(id);
        return res.status(200).json({
            courses: courses,
            message: "User's all courses fetched."
        });
    } catch (err) {
        console.error(err);
        return res.status(404).json({
            message: "No courses found for this user."
        });
    }
};

export const allCOURSES = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const sortBy = req.query.sortBy || 'Newest';
        const offset = (page - 1) * limit;
        
        const { courses, total } = await courseServices.allCourses(limit, offset, sortBy);
        return res.status(200).json({
            courses: courses,
            total: total,
            page: page,
            limit: limit,
            message: "All courses fetched successfully."
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Error fetching all courses."
        });
    }
};

export const courseByCourseId = async (req, res) => {
    try {
        const id = req.params.id;
        const course = await courseServices.courseById(id);
        if (!course) {
            return res.status(404).json({ message: "Course not found." });
        }
        
        const tutorId = await courseServices.tutorByCourseId(id);
        
        return res.status(200).json({
            course: course,
            tutorId: tutorId,
            message: "Course details and author fetched."
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Error fetching course details."
        });
    }
};

export const categoryCourse = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const sortBy = req.query.sortBy || 'Newest';
        const offset = (page - 1) * limit;
        const category = req.params.select;

        const { courses, total } = await courseServices.coursesByCategory(category, limit, offset, sortBy);
        return res.status(200).json({
            courses: courses,
            total: total,
            page: page,
            limit: limit,
            message: "Courses by category fetched."
        });
    } catch (err) {
        console.error(err);
        return res.status(404).json({
            message: "No courses found for this category."
        });
    }
};

export const searchAllCourses = async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({ message: "Search query is required." });
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const sortBy = req.query.sortBy || 'Newest';
        const offset = (page - 1) * limit;

        const { courses, total } = await courseServices.searchCourses(query, limit, offset, sortBy);
        return res.status(200).json({
            courses: courses,
            total: total,
            page: page,
            limit: limit,
            message: "Search results fetched."
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error performing search." });
    }
};