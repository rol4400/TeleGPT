declare const Tool: any;
export interface GoogleCalendarAgentParams {
    credentials: {
        clientEmail?: string;
        privateKey?: string;
        calendarId?: string;
    };
    scopes?: string[];
}
export declare class GoogleCalendarBase extends Tool {
    name: string;
    description: string;
    protected clientEmail: string;
    protected privateKey: string;
    protected calendarId: string;
    protected scopes: string[];
    constructor(fields?: GoogleCalendarAgentParams);
    getModel(): any;
    getAuth(): Promise<import("googleapis-common").JWT>;
    _call(input: string): Promise<string>;
}
export {};
