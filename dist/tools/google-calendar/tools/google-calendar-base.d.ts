import { Tool } from 'langchain/tools';
import { OpenAI } from 'langchain/llms/openai';
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
    getModel(): OpenAI;
    getAuth(): Promise<import("googleapis-common").JWT>;
    _call(input: string): Promise<string>;
}
