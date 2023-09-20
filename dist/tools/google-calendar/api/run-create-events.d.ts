import type { JWT } from 'googleapis-common';
type RunCreateEventParams = {
    calendarId: string;
    auth: JWT;
    model: any;
};
declare const runCreateEvent: (query: string, { calendarId, auth, model }: RunCreateEventParams) => Promise<string>;
export { runCreateEvent };
