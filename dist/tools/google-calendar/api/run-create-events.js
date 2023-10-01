"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCreateEvent = void 0;
const { PromptTemplate } = require('langchain/prompts');
const { LLMChain } = require('langchain/chains');
const text_spitter_js_1 = require("../../../text-spitter.js");
const googleapis_1 = require("googleapis");
const index_js_1 = require("../prompts/index.js");
const index_js_2 = require("../utils/index.js");
const run_view_events_js_1 = require("./run-view-events.js");
const calendar = googleapis_1.google.calendar('v3');
const createEvent = async ({ eventSummary, eventStartTime, eventEndTime, userTimezone, eventLocation = '', eventDescription = '' }, calendarId, auth) => {
    const event = {
        summary: eventSummary,
        location: eventLocation,
        description: eventDescription,
        start: {
            dateTime: eventStartTime,
            timeZone: userTimezone
        },
        end: {
            dateTime: eventEndTime,
            timeZone: userTimezone
        }
    };
    try {
        const createdEvent = await calendar.events.insert({
            auth,
            calendarId,
            requestBody: event
        });
        return createdEvent;
    }
    catch (error) {
        return {
            error: `An error occurred: ${error}`
        };
    }
};
const runCreateEvent = async (query, { calendarId, auth, model }) => {
    const prompt = new PromptTemplate({
        template: index_js_1.CREATE_EVENT_PROMPT,
        inputVariables: ['date', 'query', 'u_timezone', 'dayName']
    });
    const createEventChain = new LLMChain({
        llm: model,
        prompt
    });
    const date = new Date().toISOString();
    const u_timezone = (0, index_js_2.getTimezoneOffsetInHours)();
    const dayName = new Date().toLocaleString('en-us', { weekday: 'long' });
    query = query + `
  
  The current calendar events are: 
  ` + (0, run_view_events_js_1.runViewEvents)(query, {
        auth,
        model,
        calendarId: calendarId
    });
    // Ensure the character limit isn't breached
    query = await (0, text_spitter_js_1.splitText)(query);
    const output = await createEventChain.call({
        query,
        date,
        u_timezone,
        dayName
    });
    const loaded = JSON.parse(output['text']);
    const [eventSummary, eventStartTime, eventEndTime, eventLocation, eventDescription, userTimezone] = Object.values(loaded);
    const event = await createEvent({
        eventSummary,
        eventStartTime,
        eventEndTime,
        userTimezone,
        eventLocation,
        eventDescription
    }, calendarId, auth);
    if (!event.error) {
        return `Event created successfully, details: event ${event.data.htmlLink}`;
    }
    return `An error occurred creating the event: ${event.error}`;
};
exports.runCreateEvent = runCreateEvent;
//# sourceMappingURL=run-create-events.js.map