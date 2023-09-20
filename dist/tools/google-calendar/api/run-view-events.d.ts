import type { JWT } from 'googleapis-common';
type RunViewEventParams = {
    calendarId: string;
    auth: JWT;
    model: any;
};
declare const runViewEvents: (query: string, { model, auth, calendarId }: RunViewEventParams) => Promise<string>;
export { runViewEvents };
