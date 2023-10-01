const { ChatOpenAI } = require("langchain/chat_models/openai");
const { PromptTemplate } = require("langchain/prompts");
const { loadSummarizationChain } = require("langchain/chains");

import { splitText } from "../../text-spitter.js";

const summaryTemplate = `
Your role is to take a query generated from a chatbot and to summarise formatting that doesn't 
    make sense for the text to speech to speak out loud. For example, you should remove ID numbers, quotations and formatting marks, etc. 
    If a report is given (i.e. EV report or attendance list), then that makes no sense to read out loud. However, a verse or directly quoted text should
    remain untouched and as is

Below you find the query from the chatbot:
--------
{query}
--------

The output will be what is spoken by the text to speech engine and should have no extra comments
`;

const SUMMARY_PROMPT = PromptTemplate.fromTemplate(summaryTemplate);

class VoiceSummaryAgent {
  protected tools: any[]
  protected agent: any
  protected prompt_prefix: string
  protected summary_chain: any

  constructor() {
    this.prompt_prefix = ``;
  }

  async init() {
    this.tools = [];

    this.agent = new ChatOpenAI({
        temperature: 0.3,
        maxRetries: 10
      })

    this.summary_chain = loadSummarizationChain(this.agent, {
      type: "refine",
      verbose: true,
      questionPrompt: SUMMARY_PROMPT,
    });
    
    return this
  }

  async execute(input: string) {

    // Ensure the character limit isn't breached
    input = await splitText(input);

    const response = await this.summary_chain.run(input);

    return response
  }
}

export { VoiceSummaryAgent }