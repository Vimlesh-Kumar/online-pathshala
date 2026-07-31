import express from 'express';
const router = express.Router();
import * as announcementController from './announcement.controller.js';
import auth from '../../middlewares/token_validation.js';

router.get('/course/:id/announcements', announcementController.listCourseAnnouncements);
router.post('/course/:id/announcements', auth.checkToken, announcementController.createAnnouncement);
router.get('/user/tutor/announcements', auth.checkToken, announcementController.listMyAnnouncements);
router.delete('/announcements/:announcementId', auth.checkToken, announcementController.deleteAnnouncement);

export default router;
