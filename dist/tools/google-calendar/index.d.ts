declare const GoogleCalendarCreateTool: any, GoogleCalendarViewTool: any;
import type { GoogleCalendarAgentParams } from './tools/google-calendar-base.js';
type OpenAIOptions = any & {
    concurrency?: number;
    cache?: boolean;
    openAIApiKey?: string;
    configuration?: any;
};
export type CalendarAgentParams = {
    mode?: 'create' | 'view' | 'full';
    calendarOptions: GoogleCalendarAgentParams;
    executorOptions?: any;
    openApiOptions?: OpenAIOptions;
};
declare class GoogleCalendarAgent {
    protected tools: any[];
    protected agent: any;
    protected openApiOptions: any;
    protected executorOptions: any;
    constructor({ mode, calendarOptions, openApiOptions, executorOptions }: CalendarAgentParams);
    init(): Promise<this>;
    execute(input: string): Promise<any>;
}
export { GoogleCalendarAgent, GoogleCalendarCreateTool, GoogleCalendarViewTool };
