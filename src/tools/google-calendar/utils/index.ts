const { ChatOpenAI } = require('langchain/chat_models/openai');
const {
  InitializeAgentExecutorOptions,
  initializeAgentExecutorWithOptions
} = require('langchain/agents');

const { GoogleCalendarCreateTool } = import ('../google-calendar-create.js');
const { GoogleCalendarViewTool } = import ('../google-calendar-view.js');

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
  }:any) {
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
    const response = await this.agent.call({ input })
    return response
  }
}

export { GoogleCalendarAgent, GoogleCalendarCreateTool, GoogleCalendarViewTool }
