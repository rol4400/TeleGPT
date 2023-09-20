import { GoogleCalendarAgentParams, GoogleCalendarBase } from './google-calendar-base.js';
export declare class GoogleCalendarViewTool extends GoogleCalendarBase {
    name: string;
    description: string;
    constructor(fields: GoogleCalendarAgentParams);
    _call(query: string): Promise<string>;
}
