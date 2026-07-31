import express from 'express';
const router = express.Router();
import * as notificationController from './notification.controller.js';
import auth from '../../middlewares/token_validation.js';

// Mounted at /user/notifications.
router.get('/', auth.checkToken, notificationController.listNotifications);
router.post('/read', auth.checkToken, notificationController.markRead);

export default router;
