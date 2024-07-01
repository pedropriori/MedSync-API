import axios from 'axios';
import querystring from 'querystring';
import Token from '../models/TokenSchema.js';

export const getZoomTokens = async (code) => {
  const tokenURL = 'https://zoom.us/oauth/token';

  const response = await axios.post(tokenURL, querystring.stringify({
    grant_type: 'authorization_code',
    code,
    redirect_uri: process.env.ZOOM_REDIRECT_URI
  }), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString('base64')}`
    }
  });

  const tokens = response.data;
  const expiry = new Date(Date.now() + tokens.expires_in * 1000);

  const tokenDoc = new Token({
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiry
  });

  await tokenDoc.save();

  return tokens;
};

export const refreshZoomTokens = async (refreshToken) => {
  const tokenURL = 'https://zoom.us/oauth/token';

  const response = await axios.post(tokenURL, querystring.stringify({
    grant_type: 'refresh_token',
    refresh_token: refreshToken
  }), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString('base64')}`
    }
  });

  const tokens = response.data;
  const expiry = new Date(Date.now() + tokens.expires_in * 1000);

  const tokenDoc = await Token.findOne();
  tokenDoc.accessToken = tokens.access_token;
  tokenDoc.refreshToken = tokens.refresh_token;
  tokenDoc.expiry = expiry;

  await tokenDoc.save();

  return tokens;
};

export const getAccessToken = async () => {
  const tokenDoc = await Token.findOne();

  if (!tokenDoc) {
    throw new Error("No token data found");
  }

  if (new Date() < tokenDoc.expiry) {
    return tokenDoc.accessToken;
  }

  const tokens = await refreshZoomTokens(tokenDoc.refreshToken);
  return tokens.access_token;
};

export const createZoomMeeting = async ({ topic, start_time, duration }) => {
  const accessToken = await getAccessToken();

  const response = await axios.post('https://api.zoom.us/v2/users/me/meetings', {
    topic,
    type: 2,
    start_time,
    duration,
    timezone: "America/Sao_Paulo",
    settings: {
      host_video: true,
      participant_video: true,
      join_before_host: false,
      mute_upon_entry: true,
      waiting_room: true,
      approval_type: 2,
      audio: "both",
    }
  }, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    }
  });

  return response.data;
};
