"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TiktikBase = void 0;
const { Tool } = require('langchain/tools');
const { OpenAI } = require('langchain/llms/openai');
class TiktikBase extends Tool {
    constructor() {
        super();
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'Todo and Reminders List'
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'A tool to add, edit, and view todo lists and reminders'
        });
    }
    getModel() {
        return new OpenAI({
            temperature: 0
        });
    }
    async _call(query) {
        return query;
    }
}
exports.TiktikBase = TiktikBase;
//# sourceMappingURL=tiktik-base.js.map