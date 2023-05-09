const objectiveServices = require('../services/courseObjectives.service')

module.exports = {
    courseObjectives: (req, res) => {
        // console.log(req.body);
        // console.log(req.body.course_id);
        // objectivesArray=req.body.objectives;
        // console.log(objectivesArray)

        var objectives = req.body.objectives

        var allObjectives = [];
        (objectives).forEach(element => {
            element.course_id = req.body.course_id
            allObjectives.push(Object.values(element));
        });

        console.log(allObjectives)
        objectiveServices.addingObjectivesInDB(allObjectives, (err, result) => {
            if (err) {
                return res.status(404).json({
                    message: "Problem in Objectives inserting."
                })
            }
            return res.status(200).json({
                objectives: result,
                message: "Objective Inserted!"
            })
        })

    },

    getObjectives: (req, res) => {
        // console.log(req.params)
        const course_id = req.params.id
        objectiveServices.gettingObjectivesFromDB(course_id, (error, result) => {
            if (error) {
                return res.status(404).json({
                    message: "Problem in finding Objectives."
                })
            }
            return res.status(200).json({
                objectives: result,
                message: "Objectives"
            })
        })
    },

    updateObjective: (req, res) => {
        // console.log(req.body)
        objectiveServices.updateObjectiveInDB(req.body, (error, result) => {
            if (error) {
                return res.status(404).json({
                    message: "Problem in updating Objectives."
                })
            }
            return res.status(200).json({
                updatedObjective: result,
                message: "Objective Updated Successfully!!"
            })
        })
    },

    deleteObjective: (req, res) => {
        console.log(req.params)
        objectiveServices.deleteObj(req.params.id, (error, result) => {
            if (error) {
                return res.status(404).json({
                    message: "Problem in deleting Objective."
                })
            }
            return res.status(200).json({
                deletedObjective: result,
                message: "Objective deleted Successfully!!"
            })
        })
    }
}