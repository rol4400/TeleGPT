const { ChatOpenAI } = require('langchain/chat_models/openai')
const {
  InitializeAgentExecutorOptions,
  initializeAgentExecutorWithOptions
} = require('langchain/agents')
const {
  TiktikAddTask, TiktikGetTasks
} = require('./tools/index.js')

const { DynamicStructuredTool } = require("langchain/tools");
const { MessagesPlaceholder } = require("langchain/prompts");
const { PromptTemplate } = require ('langchain/prompts');
const { LLMChain } = require ('langchain/chains');
const { z } = require("zod");

import type { TiktikBase } from './tools/tiktik-base.js'

import { splitText } from "../../text-spitter.js";

// type OpenAIOptions =
//   any & {
//     concurrency?: number
//     cache?: boolean
//     openAIApiKey?: string
//     configuration?: any
//   }

// class MessageSenderAgent {
//   protected tools: any[]
//   protected agent: any
//   protected openApiOptions: any
//   protected executorOptions: any
//   memory: any
//   prompt_prefix: any

//   sendTelegramMessage = async ({ chat_id, message }: any) => {

//     console.log("SENT MESSAGE: " + message + " to: " + chat_id);
// 		return;
// 		// try {
// 		// 	//var result = await this.client.sendMessage(BigInt(chat_id), { message: message });
// 		// } catch (error) {
// 		// 	return "Failed to send message with error: " + error;
// 		// }
// 		// //return "The result of trying to send the message was: " + result;
// 	}

//   constructor(memory: any) {

//     this.memory = memory;

//     this.prompt_prefix = `Your purpose is to draft a text message `;

//     this.openApiOptions = { temperature: 0 }
//     this.executorOptions = {
//       agentType: 'chat-zero-shot-react-description',
//       verbose: true,
//       memory: this.memory,
// 			agentArgs: {
// 				prefix: this.prompt_prefix,
// 				inputVariables: ["input", "agent_scratchpad", "chat_history"],
// 				memoryPrompts: [new MessagesPlaceholder("chat_history")],
// 			},
// 			handleParsingErrors: "Please try again, paying close attention to the allowed values",
//     }
//     this.tools =
//     [
//       new DynamicStructuredTool({
// 				name: "telegram-send-message",
// 				description: "Sends a message to a telegram chatroom. You must first use telegram-chatroom-or-user-search to get the chat_id of the user you want to send to. You must never use this without first asking for confirmation about what you want to send",
// 				schema: z.object({
// 					chat_id: z.string().describe("The ID of the user to send the message to. It MUST be a positive number with 9 digits"),
// 					message: z.string().describe("The message to send. Keep it brief and in a text message style. Start messages with 'Anneyonghasimnikka' as the greeting but only if necessary"),
// 				}),
// 				func: this.sendTelegramMessage
// 			}),
//     ]
//   }

//   async init() {

//     const prompt = new PromptTemplate({
//       template: VIEW_EVENTS_PROMPT,
//       inputVariables: ['date', 'query', 'u_timezone', 'dayName']
//     })
//     const viewEventsChain = new LLMChain({
//       llm: model,
//       prompt
//     })

//     this.agent = await initializeAgentExecutorWithOptions(
//       this.tools,
//       new ChatOpenAI(this.openApiOptions),
//       this.executorOptions
//     )
//     return this
//   }

//   async execute(input: string) {

//     // Ensure the character limit isn't breached
//     input = await splitText(input);

//     const response = await this.agent.call({ input: input })
//     return response
//   }
// }

export { TiktikAddTask, TiktikGetTasks }