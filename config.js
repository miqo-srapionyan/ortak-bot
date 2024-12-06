const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

/**
 * Application Configuration
 *
 * This configuration object centralizes all environment-related configurations.
 * It uses environment variables with fallback defaults where applicable.
 */
const config = {
    api: {
        ortakBaseURL: process.env.ORTAK_BASE_URL,
    },

    output: {
        jsonDB: process.env.JSON_DB,
        buyNftPayload: process.env.BUY_NFT_PAYLOAD,
        buyNftCurl: process.env.BUY_NFT_CURL,
    },

    // Telegram bot configurations (example specific to your use case)
    telegram: {
        token: process.env.TELEGRAM_BOT_TOKEN || '',
        chatId: process.env.TELEGRAM_CHAT_ID || '',
    },
};

module.exports = config;
