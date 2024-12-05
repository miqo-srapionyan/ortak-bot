require('dotenv').config(); // Load environment variables from .env
const fs = require('fs');
const nodemailer = require('nodemailer');

class OrtakScheduler {
    constructor() {
        this.JSON_DB = process.env.JSON_DB;
        this.ORTAK_BASE_URL = process.env.ORTAK_BASE_URL;
        this.EMAIL_HOST = process.env.EMAIL_HOST;
        this.EMAIL_PORT = process.env.EMAIL_PASSWORD;
        this.EMAIL_USER = process.env.EMAIL_USER;
        this.EMAIL_PASS = process.env.EMAIL_PASS;
        this.RECIPIENTS = process.env.RECIPIENTS.split(',');
    }

    async sendEmail(subject, text) {
        const transporter = nodemailer.createTransport({
            host: this.EMAIL_HOST,
            port: this.EMAIL_PORT,
            auth: {
                user: this.EMAIL_USER,
                pass: this.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: this.EMAIL_USER,
            to: this.RECIPIENTS,
            subject: subject,
            text: text
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log('Alert email sent successfully.');
        } catch (error) {
            console.error('Error sending email:', error);
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
            await this.sendEmail(
                'Alert: New Collection on Ortak: ' + latestSlug,
                'A new collection has been added to Ortak. ' + latestSlug
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
