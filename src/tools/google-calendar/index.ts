const { ChatOpenAI } = require('langchain/chat_models/openai')
const {
  InitializeAgentExecutorOptions,
  initializeAgentExecutorWithOptions
} = require('langchain/agents')
const {
  GoogleCalendarCreateTool,
  GoogleCalendarViewTool
} = require('./tools/index.js')
import type { GoogleCalendarAgentParams } from './tools/google-calendar-base.js'

import { splitText } from "../../text-spitter.js";

type OpenAIOptions =
  any & {
    concurrency?: number
    cache?: boolean
    openAIApiKey?: string
    configuration?: any
  }

export type CalendarAgentParams = {
  mode?: 'create' | 'view' | 'full'
  calendarOptions: GoogleCalendarAgentParams
  executorOptions?: any
  openApiOptions?: OpenAIOptions
}

class GoogleCalendarAgent {
  protected tools: any[]
  protected agent: any
  protected openApiOptions: any
  protected executorOptions: any

  constructor({
    mode = 'full',
    calendarOptions,
    openApiOptions = { temperature: 0 },
    executorOptions = {
      agentType: 'chat-zero-shot-react-description',
      verbose: true
    }
  }: CalendarAgentParams) {
    this.openApiOptions = openApiOptions
    this.executorOptions = executorOptions
    this.tools =
      mode === 'create'
        ? [new GoogleCalendarCreateTool(calendarOptions)]
        : mode === 'view'
        ? [new GoogleCalendarViewTool(calendarOptions)]
        : [
            new GoogleCalendarCreateTool(calendarOptions),
            new GoogleCalendarViewTool(calendarOptions)
          ]
  }

  async init() {
    this.agent = await initializeAgentExecutorWithOptions(
      this.tools,
      new ChatOpenAI(this.openApiOptions),
      this.executorOptions
    )
    return this
  }

  async execute(input: string) {

    // Ensure the character limit isn't breached
    input = await splitText(input);

    const response = await this.agent.call({ input: input })
    return response
  }
}

export { GoogleCalendarAgent, GoogleCalendarCreateTool, GoogleCalendarViewTool }