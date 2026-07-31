import express from 'express';
const router = express.Router();
import * as certificateController from './certificate.controller.js';

// Public — a certificate is only useful if anyone can check it.
router.get('/certificates/verify/:key', certificateController.verifyCertificate);

export default router;
