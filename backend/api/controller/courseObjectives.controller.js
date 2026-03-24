import * as objectiveServices from '../services/courseObjectives.service.js';

export const courseObjectives = async (req, res) => {
    try {
        const objectives = req.body.objectives;
        const allObjectives = objectives.map(element => {
            return [element.objective, req.body.course_id];
        });

        const result = await objectiveServices.addingObjectivesInDB(allObjectives);
        return res.status(200).json({
            objectives: result,
            message: "Objective Inserted!"
        });
    } catch (err) {
        console.error(err);
        return res.status(404).json({ message: "Problem in Objectives inserting." });
    }
};

export const getObjectives = async (req, res) => {
    try {
        const course_id = req.params.id;
        const result = await objectiveServices.gettingObjectivesFromDB(course_id);
        return res.status(200).json({
            objectives: result,
            message: "Objectives fetched."
        });
    } catch (error) {
        console.error(error);
        return res.status(404).json({ message: "Problem in finding Objectives." });
    }
};

export const updateObjective = async (req, res) => {
    try {
        const result = await objectiveServices.updateObjectiveInDB(req.body);
        return res.status(200).json({
            updatedObjective: result,
            message: "Objective Updated Successfully!!"
        });
    } catch (error) {
        console.error(error);
        return res.status(404).json({ message: "Problem in updating Objectives." });
    }
};

export const deleteObjective = async (req, res) => {
    try {
        const result = await objectiveServices.deleteObj(req.params.id);
        return res.status(200).json({
            deletedObjective: result,
            message: "Objective deleted Successfully!!"
        });
    } catch (error) {
        console.error(error);
        return res.status(404).json({ message: "Problem in deleting Objective." });
    }
};