import { getZoomTokens, refreshZoomTokens } from '../services/zoomService.js';

export const handleZoomOAuthCallback = async (req, res) => {
  try {
    const { code } = req.query;
    const tokens = await getZoomTokens(code);
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tokens from Zoom' });
  }
};

export const handleZoomTokenRefresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await refreshZoomTokens(refreshToken);
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ error: 'Failed to refresh tokens from Zoom' });
  }
};
