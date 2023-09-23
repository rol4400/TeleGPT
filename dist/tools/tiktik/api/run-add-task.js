"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAddTask = void 0;
require('dotenv').config();
const { PromptTemplate } = require('langchain/prompts');
const { LLMChain } = require('langchain/chains');
const axios = require("axios");
const text_spitter_js_1 = require("../../../text-spitter.js");
const googleapis_1 = require("googleapis");
const index_js_1 = require("../prompts/index.js");
const get_timezone_offset_in_hours_js_1 = require("../../google-calendar/utils/get-timezone-offset-in-hours.js");
const calendar = googleapis_1.google.calendar('v3');
const addTask = async (params) => {
    var config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://ticktick.com/open/v1/task',
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.TIKTIK_API}`,
        },
        data: params
    };
    try {
        const response = await axios.request(config);
        console.log(JSON.stringify(response.data));
        return JSON.stringify(response.data);
    }
    catch (error) {
        console.log(error);
        return JSON.stringify(error);
    }
};
const runAddTask = async (query, { model }) => {
    const prompt = new PromptTemplate({
        template: index_js_1.ADD_TASK_PROMPT,
        inputVariables: ['date', 'query', 'u_timezone', 'dayName']
    });
    const createEventChain = new LLMChain({
        llm: model,
        prompt
    });
    const date = new Date().toISOString();
    const u_timezone = (0, get_timezone_offset_in_hours_js_1.getTimezoneOffsetInHours)();
    const dayName = new Date().toLocaleString('en-us', { weekday: 'long' });
    // Ensure the character limit isn't breached
    query = await (0, text_spitter_js_1.splitText)(query);
    const output = await createEventChain.call({
        query,
        date,
        u_timezone,
        dayName
    });
    const loaded = JSON.parse(output['text']);
    return await addTask(loaded);
};
exports.runAddTask = runAddTask;
//# sourceMappingURL=run-add-task.js.map