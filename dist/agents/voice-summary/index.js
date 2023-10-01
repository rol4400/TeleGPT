"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceSummaryAgent = void 0;
const { ChatOpenAI } = require("langchain/chat_models/openai");
const { initializeAgentExecutorWithOptions } = require("langchain/agents");
const text_spitter_js_1 = require("../../text-spitter.js");
class VoiceSummaryAgent {
    constructor() {
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
        Object.defineProperty(this, "prompt_prefix", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.prompt_prefix = `Your role is to take a query generated from a chatbot and to summarise formatting that doesn't 
    make sense for the text to speech to speak out loud. For example, you should remove ID numbers, quotations and formatting marks, etc. 
    If a report is given (i.e. EV report or attendance list), then that makes no sense to read out loud. However, a verse or directly quoted text should
    remain untouched and as is`;
    }
    async init() {
        this.tools = [];
        this.agent = await initializeAgentExecutorWithOptions(this.tools, new ChatOpenAI({
            temperature: 0.3,
            maxRetries: 10
        }), {
            agentType: "openai-functions",
            agentArgs: {
                prefix: this.prompt_prefix,
                inputVariables: ["input"],
            }
        });
        return this;
    }
    async execute(input) {
        // Ensure the character limit isn't breached
        input = await (0, text_spitter_js_1.splitText)(input);
        const response = await this.agent.call({ input: input });
        return response;
    }
}
exports.VoiceSummaryAgent = VoiceSummaryAgent;
//# sourceMappingURL=index.js.map