"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceSummaryAgent = void 0;
require('dotenv').config();
const { ChatOpenAI } = require("langchain/chat_models/openai");
const { PromptTemplate } = require("langchain/prompts");
const { LLMChain } = require("langchain/chains");
const text_spitter_js_1 = require("../../text-spitter.js");
const summaryTemplate = `
Your role is to take an answer generated from a chatbot and to summarise formatting that doesn't 
make sense for the text to speech to speak out loud. For example, you should remove ID numbers (large numbers), quotations and formatting marks, etc. 

Remove lists and checklists and just mention the main point. Keep the output short (a single paragraph if possible)

However, a verse or text paragraph should remain untouched and as is
The output will be what is spoken by the text to speech engine and should have no extra comments. 

The text is as follows: {query}

Please output the refined query alone with no other comments
`;
const SUMMARY_PROMPT = PromptTemplate.fromTemplate(summaryTemplate);
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
        Object.defineProperty(this, "summary_chain", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.prompt_prefix = ``;
    }
    async init() {
        this.tools = [];
        this.agent = new ChatOpenAI({
            temperature: 0.3,
            maxRetries: 10
        });
        this.summary_chain = new LLMChain({
            llm: this.agent,
            prompt: SUMMARY_PROMPT,
            verbose: (process.env.NODE_ENV === "production" ? false : true)
        });
        return this;
    }
    async execute(input) {
        // Ensure the character limit isn't breached
        input = await (0, text_spitter_js_1.splitText)(input);
        const response = await this.summary_chain.run(input);
        return response;
    }
}
exports.VoiceSummaryAgent = VoiceSummaryAgent;
//# sourceMappingURL=index.js.map