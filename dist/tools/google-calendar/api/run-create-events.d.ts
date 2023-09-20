import type { JWT } from 'googleapis-common';
import type { OpenAI } from 'langchain/llms/openai';
type RunCreateEventParams = {
    calendarId: string;
    auth: JWT;
    model: OpenAI;
};
declare const runCreateEvent: (query: string, { calendarId, auth, model }: RunCreateEventParams) => Promise<string>;
export { runCreateEvent };
