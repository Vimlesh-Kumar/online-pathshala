import * as objectivesRepository from './courseObjectives.repository.js';

export const addingObjectivesInDB = async (objectives) => objectivesRepository.addingObjectivesInDB(objectives);

export const gettingObjectivesFromDB = async (course_id) => objectivesRepository.gettingObjectivesFromDB(course_id);

export const updateObjectiveInDB = async (data) => objectivesRepository.updateObjectiveInDB(data);

export const deleteObj = async (id) => objectivesRepository.deleteObj(id);