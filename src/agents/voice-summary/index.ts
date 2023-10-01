const { ChatOpenAI } = require("langchain/chat_models/openai");
const { initializeAgentExecutorWithOptions } = require("langchain/agents");
import { splitText } from "../../text-spitter.js";

class VoiceSummaryAgent {
  protected tools: any[]
  protected agent: any
  protected prompt_prefix: string
  constructor() {
    this.prompt_prefix = `Your role is to take a query generated from a chatbot and to summarise formatting that doesn't 
    make sense for the text to speech to speak out loud. For example, you should remove ID numbers, quotations and formatting marks, etc. 
    If a report is given (i.e. EV report or attendance list), then that makes no sense to read out loud. However, a verse or directly quoted text should
    remain untouched and as is`;
  }

  async init() {
    this.tools = [];
    
    this.agent = await initializeAgentExecutorWithOptions(
      this.tools,
      new ChatOpenAI({
        temperature: 0.3,
        maxRetries: 10
      }),
      {
        agentType: "openai-functions",
        agentArgs: {
          prefix: this.prompt_prefix,
          inputVariables: ["input"],
        }
      }
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

export { VoiceSummaryAgent }