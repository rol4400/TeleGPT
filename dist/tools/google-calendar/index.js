"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleCalendarViewTool = exports.GoogleCalendarCreateTool = exports.GoogleCalendarAgent = void 0;
const { ChatOpenAI } = require('langchain/chat_models/openai');
const { InitializeAgentExecutorOptions, initializeAgentExecutorWithOptions } = require('langchain/agents');
const { GoogleCalendarCreateTool, GoogleCalendarViewTool } = require('./tools/index.js');
exports.GoogleCalendarCreateTool = GoogleCalendarCreateTool;
exports.GoogleCalendarViewTool = GoogleCalendarViewTool;
class GoogleCalendarAgent {
    constructor({ mode = 'full', calendarOptions, openApiOptions = { temperature: 0 }, executorOptions = {
        agentType: 'chat-zero-shot-react-description',
        verbose: true
    } }) {
        Object.defineProperty(this, "tools", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "agent", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "openApiOptions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "executorOptions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.openApiOptions = openApiOptions;
        this.executorOptions = executorOptions;
        this.tools =
            mode === 'create'
                ? [new GoogleCalendarCreateTool(calendarOptions)]
                : mode === 'view'
                    ? [new GoogleCalendarViewTool(calendarOptions)]
                    : [
                        new GoogleCalendarCreateTool(calendarOptions),
                        new GoogleCalendarViewTool(calendarOptions)
                    ];
    }
    async init() {
        this.agent = await initializeAgentExecutorWithOptions(this.tools, new ChatOpenAI(this.openApiOptions), this.executorOptions);
        return this;
    }
    async execute(input) {
        const response = await this.agent.call({ input });
        return response;
    }
}
exports.GoogleCalendarAgent = GoogleCalendarAgent;
//# sourceMappingURL=index.js.map