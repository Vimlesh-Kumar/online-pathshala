import * as sectionLecturesServices from "../services/section&Lectures.services.js";

export const sectionLectures = async (req, res) => {
    try {
        const lectures = req.body;
        const allLectures = Object.values(lectures).map(element => Object.values(element));

        const result = await sectionLecturesServices.addLectures(allLectures);
        return res.status(200).json({
            lectureInsertResult: result,
            message: "All Lectures of this Section Inserted!"
        });
    } catch (error) {
        console.error(error);
        return res.status(404).json({ message: "Problem in Lecture inserting." });
    }
};

export const allSectionForTutur = async (req, res) => {
    try {
        const result = await sectionLecturesServices.allSectionsbycourseId(req.query.course_id);
        return res.status(200).json({
            allsectionLecturesDetails: result,
            message: "All Lectures inside sections by course id"
        });
    } catch (error) {
        console.error(error);
        return res.status(404).json({ message: "Problem in finding all section with lectures." });
    }
};