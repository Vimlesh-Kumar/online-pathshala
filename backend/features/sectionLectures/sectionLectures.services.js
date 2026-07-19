import * as lecturesRepository from './sectionLectures.repository.js';

export const addLectures = async (allLectures) => lecturesRepository.addLectures(allLectures);

export const allSectionsbycourseId = async (id) => lecturesRepository.allSectionsbycourseId(id);