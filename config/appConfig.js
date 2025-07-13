require('dotenv').config();

const DEBUG_MODE = process.env.DEBUG_MODE === 'true';
const PORT = process.env.PORT || 3000;

const CORS_ALLOWED_ORIGINS = process.env.FRONTEND_URLS
    ? process.env.FRONTEND_URLS.split(',').map(url => url.trim())
    : DEFAULT_FRONTEND_URLS

module.exports = {
    DEBUG_MODE,
    PORT,
    CORS_ALLOWED_ORIGINS
};