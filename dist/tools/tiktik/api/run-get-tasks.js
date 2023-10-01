"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runGetTask = void 0;
require('dotenv').config();
const tick = require("./tick");
const { PromptTemplate } = require("langchain/prompts");
const { LLMChain } = require("langchain/chains");
const index_js_1 = require("../prompts/index.js");
const text_spitter_js_1 = require("../../../text-spitter.js");
const SUMMARY_PROMPT = PromptTemplate.fromTemplate(index_js_1.GET_TASKS_PROMPT);
const runGetTask = async (query, { model }) => {
    var summary_chain = new LLMChain({
        llm: model,
        prompt: SUMMARY_PROMPT,
        verbose: (process.env.NODE_ENV === "production" ? false : true)
    });
    let t = new tick({ username: process.env.TIKTIK_USER, password: process.env.TIKTIK_PASS });
    var results = await t.get_all_tasks();
    // Shorten for token limit
    results = await (0, text_spitter_js_1.splitText)(results);
    var output = await summary_chain.call({
        query: query,
        api: results
    });
    return output;
};
exports.runGetTask = runGetTask;
//# sourceMappingURL=run-get-tasks.js.map