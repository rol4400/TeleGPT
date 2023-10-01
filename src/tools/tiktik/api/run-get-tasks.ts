require('dotenv').config();

const tick = require("./tick")
const { PromptTemplate } = require("langchain/prompts");
const { LLMChain } = require("langchain/chains");

import { GET_TASKS_PROMPT } from '../prompts/index.js'
import { splitText } from "../../../text-spitter.js";

const SUMMARY_PROMPT = PromptTemplate.fromTemplate(GET_TASKS_PROMPT);

const runGetTask = async (query: string, { model }: any) => {

    var summary_chain = new LLMChain({
        llm: model,
        prompt: SUMMARY_PROMPT,
        verbose: (process.env.NODE_ENV === "production" ? false : true)
    });

    let t = new tick({ username: process.env.TIKTIK_USER, password: process.env.TIKTIK_PASS });
    var results = await t.get_all_tasks();

    // Shorten for token limit
    results = await splitText(results);

    var output = await summary_chain.call({
        query: query,
        api: results
    })

    return output;
}

export { runGetTask }
