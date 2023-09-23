"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runViewEvents = void 0;
const { PromptTemplate } = require('langchain/prompts');
const { LLMChain } = require('langchain/chains');
const { splitText } = require("text-spitter.js");
const googleapis_1 = require("googleapis");
const index_js_1 = require("../prompts/index.js");
const index_js_2 = require("../utils/index.js");
const calendar = googleapis_1.google.calendar('v3');
const runViewEvents = async (query, { model, auth, calendarId }) => {
    const prompt = new PromptTemplate({
        template: index_js_1.VIEW_EVENTS_PROMPT,
        inputVariables: ['date', 'query', 'u_timezone', 'dayName']
    });
    const viewEventsChain = new LLMChain({
        llm: model,
        prompt
    });
    const date = new Date().toISOString();
    const u_timezone = (0, index_js_2.getTimezoneOffsetInHours)();
    const dayName = new Date().toLocaleString('en-us', { weekday: 'long' });
    // Ensure the character limit isn't breached
    query = await splitText(query);
    const output = await viewEventsChain.call({
        query,
        date,
        u_timezone,
        dayName
    });
    const loaded = JSON.parse(output['text']);
    try {
        const response = await calendar.events.list({
            auth,
            calendarId,
            ...loaded
        });
        const curatedItems = response.data && response.data.items
            ? response.data.items.map(({ status, summary, description, start, end }) => ({
                status,
                summary,
                description,
                start,
                end
            }))
            : [];
        return ('Result for the prompt "' +
            query +
            '": \n' +
            JSON.stringify(curatedItems, null, 2));
    }
    catch (error) {
        return `An error occurred: ${error}`;
    }
};
exports.runViewEvents = runViewEvents;
//# sourceMappingURL=run-view-events.js.map