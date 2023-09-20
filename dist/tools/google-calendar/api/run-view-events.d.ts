import type { JWT } from 'googleapis-common';
import type { OpenAI } from 'langchain/llms/openai';
type RunViewEventParams = {
    calendarId: string;
    auth: JWT;
    model: OpenAI;
};
declare const runViewEvents: (query: string, { model, auth, calendarId }: RunViewEventParams) => Promise<string>;
export { runViewEvents };
