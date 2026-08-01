import express from 'express';
const router = express.Router();
import * as linkPreviewController from './linkPreview.controller.js';
import auth from '../../middlewares/token_validation.js';

// Mounted at /user/links. This endpoint makes the server fetch a URL the caller
// chose, so it stays behind a token — an open version would be an SSRF probe
// anyone on the internet could aim at this host.
router.post('/preview', auth.checkToken, linkPreviewController.preview);

export default router;
