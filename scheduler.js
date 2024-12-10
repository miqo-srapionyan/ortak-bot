const { api: { ortakBaseURL }, telegram: { token, chatId }, output: { jsonDB } } = require('./config')
const TelegramBot = require('node-telegram-bot-api');
const FileHandler = require('./services/file_handler');

class OrtakScheduler extends FileHandler {
    constructor() {
        super();
        this.JSON_DB = jsonDB;
        this.ORTAK_BASE_URL = ortakBaseURL;
        this.BOT_TOKEN = token;
        this.CHAT_ID = chatId;
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
        const fileData = this.readFile(this.JSON_DB);

        return fileData?.id;
    }

    saveLatestItem(latestItem) {
        this.writeToFile(latestItem, this.JSON_DB)
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
                `🚨 Alert: New Collection on Ortak!\n`+
                `Name: ${latestItem.name}\n`+
                `ID: ${latestId}\n`+
                `Link: ${this.ORTAK_BASE_URL}/collections/${latestSlug}/nfts\n`+
                `Homepage: ${this.ORTAK_BASE_URL}`
            );
            this.saveLatestItem(latestItem);
        }
    }

    startScheduler(intervalMinutes) {
        this.processData(); // Run immediately
        setInterval(() => this.processData(), intervalMinutes * 60 * 1000);
    }
}

// Initialize and start the scheduler
const scheduler = new OrtakScheduler();
scheduler.startScheduler(10); // Runs every 10 minutes
