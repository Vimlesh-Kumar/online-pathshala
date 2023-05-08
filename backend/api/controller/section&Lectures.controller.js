const sectionLecturesServices = require("../services/section&Lectures.services")

module.exports = {
    sectionLectures: (req, res) => {
        console.log(req.body)
        var lectures = req.body

        var allLectures = [];
        (lectures).forEach(element => {
            allLectures.push(Object.values(element))
        });

        console.log(allLectures)
        sectionLecturesServices.addLectures(allLectures, (error, result) =>{
            if(error) {
                return res.status(404).json({
                    message: "Problem in Lecture inserting."
                })
            }
            return res.status(200).json({
                lectureInsertResult: result,
                message: "All Lecture of this Section Inserted!"
            })
        })
    }
}