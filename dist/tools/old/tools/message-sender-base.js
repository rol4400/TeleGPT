"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageSenderBase = void 0;
const { Tool } = require('langchain/tools');
const { OpenAI } = require('langchain/llms/openai');
class MessageSenderBase extends Tool {
    constructor(fields = {}) {
        super();
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'Message Sender'
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'A tool to draft messages and send them on telegram'
        });
    }
    getModel() {
        return new OpenAI({
            temperature: 0
        });
    }
    async _call(input) {
        return input;
    }
}
exports.MessageSenderBase = MessageSenderBase;
//# sourceMappingURL=message-sender-base.js.map