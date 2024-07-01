import express from 'express';
import { handleZoomOAuthCallback, handleZoomTokenRefresh } from '../Controllers/zoomController.js';

const router = express.Router();

router.get('/oauth/callback', handleZoomOAuthCallback);
router.post('/oauth/refresh', handleZoomTokenRefresh);

export default router;
