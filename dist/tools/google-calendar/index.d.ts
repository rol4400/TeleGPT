import { ChatOpenAI } from 'langchain/chat_models/openai';
import type { AzureOpenAIInput, OpenAIChatInput } from 'langchain/chat_models/openai';
import { InitializeAgentExecutorOptions } from 'langchain/agents';
import { GoogleCalendarCreateTool, GoogleCalendarViewTool } from './tools/index.js';
import type { GoogleCalendarAgentParams } from './tools/google-calendar-base.js';
type OpenAIOptions = Partial<OpenAIChatInput> & Partial<AzureOpenAIInput> & any & {
    concurrency?: number;
    cache?: boolean;
    openAIApiKey?: string;
    configuration?: any;
};
export type CalendarAgentParams = {
    mode?: 'create' | 'view' | 'full';
    calendarOptions: GoogleCalendarAgentParams;
    executorOptions?: InitializeAgentExecutorOptions;
    openApiOptions?: OpenAIOptions;
};
declare class GoogleCalendarAgent {
    protected tools: any[];
    protected agent: any;
    protected openApiOptions: Partial<ChatOpenAI>;
    protected executorOptions: InitializeAgentExecutorOptions;
    constructor({ mode, calendarOptions, openApiOptions, executorOptions }: CalendarAgentParams);
    init(): Promise<this>;
    execute(input: string): Promise<any>;
}
export { GoogleCalendarAgent, GoogleCalendarCreateTool, GoogleCalendarViewTool };
