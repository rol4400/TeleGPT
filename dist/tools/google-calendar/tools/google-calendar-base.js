"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleCalendarBase = void 0;
const googleapis_1 = require("googleapis");
const { Tool } = require('langchain/tools');
const { OpenAI } = require('langchain/llms/openai');
class GoogleCalendarBase extends Tool {
    constructor(fields = {
        credentials: {
            clientEmail: process.env.CLIENT_EMAIL,
            privateKey: process.env.PRIVATE_KEY,
            calendarId: process.env.CALENDAR_ID
        },
        scopes: [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events'
        ]
    }) {
        super();
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'Google Calendar'
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'A tool to lookup Google Calendar events and create events in Google Calendar'
        });
        Object.defineProperty(this, "clientEmail", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "privateKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "calendarId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "scopes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        if (!fields.credentials) {
            throw new Error('Missing credentials');
        }
        if (!fields.credentials.clientEmail) {
            throw new Error('Missing client email');
        }
        if (!fields.credentials.privateKey) {
            throw new Error('Missing private key');
        }
        if (!fields.credentials.calendarId) {
            throw new Error('Missing calendar ID');
        }
        this.clientEmail = fields.credentials.clientEmail;
        this.privateKey = fields.credentials.privateKey;
        this.calendarId = fields.credentials.calendarId;
        this.scopes = fields.scopes || [];
    }
    getModel() {
        return new OpenAI({
            temperature: 0
        });
    }
    async getAuth() {
        const auth = new googleapis_1.google.auth.JWT(this.clientEmail, undefined, this.privateKey, this.scopes);
        return auth;
    }
    async _call(input) {
        return input;
    }
}
exports.GoogleCalendarBase = GoogleCalendarBase;
//# sourceMappingURL=google-calendar-base.js.map