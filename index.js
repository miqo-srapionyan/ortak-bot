require('dotenv').config(); // Load environment variables from .env
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');

class OrtakScheduler {
    constructor() {
        this.JSON_DB = process.env.JSON_DB;
        this.ORTAK_BASE_URL = process.env.ORTAK_BASE_URL;
        this.BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        this.CHAT_ID = process.env.TELEGRAM_CHAT_ID;
        this.bot = new TelegramBot(this.BOT_TOKEN, { polling: false }); // Create a bot instance
    }

    async sendTelegramMessage(message) {
        try {
            await this.bot.sendMessage(this.CHAT_ID, message);
            console.log('Alert sent to Telegram successfully.');
        } catch (error) {
            console.error('Error sending Telegram message:', error);
        }
    }

    async fetchLatestCollection() {
        try {
            const response = await fetch(`${this.ORTAK_BASE_URL}/panel/collections`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sortBy: 'newest',
                    limit: 1,
                    page: 1,
                    partnerId: 0
                })
            });

            if (!response.ok) {
                throw new Error(`Error in API response: ${response.statusText}`);
            }

            const data = await response.json();
            if (data.code !== 0) {
                throw new Error(`Unexpected response code: ${data.code}`);
            }

            return data.data.items[0];
        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    }

    loadStoredId() {
        if (fs.existsSync(this.JSON_DB)) {
            const fileData = fs.readFileSync(this.JSON_DB, 'utf-8');
            return JSON.parse(fileData).latestId;
        }

        return null;
    }

    saveLatestItem(latestItem) {
        fs.writeFileSync(this.JSON_DB, JSON.stringify(latestItem, null, 2));
    }

    async processData() {
        const latestItem = await this.fetchLatestCollection();
        if (!latestItem) return;

        const latestId = latestItem.id;
        const latestSlug = latestItem.slug;
        const storedId = this.loadStoredId();

        if (!storedId || latestId > storedId) {
            console.log('New collection detected:', latestId, latestSlug);
            await this.sendTelegramMessage(
                `🚨 Alert: New Collection on Ortak!\n\nName: ${latestItem.name}\nID: ${latestId}\nLink: ${this.ORTAK_BASE_URL}/collections/${latestSlug}/nfts`
            );
            this.saveLatestItem(latestItem);
        } else {
            console.log('No new collection detected.');
        }
    }

    startScheduler(intervalMinutes) {
        this.processData(); // Run immediately
        setInterval(() => this.processData(), intervalMinutes * 60 * 1000);
    }
}

// Initialize and start the scheduler
const scheduler = new OrtakScheduler();
scheduler.startScheduler(30); // Runs every 30 minutes
