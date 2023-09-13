require('dotenv').config();
// const { OpenAIApi } = require('openai');

// Langchain Configuration
const { z } = require("zod");
const { ChatOpenAI } = require("langchain/chat_models/openai");
const { initializeAgentExecutorWithOptions } = require("langchain/agents");
const { Calculator } = require("langchain/tools/calculator");
const { MessagesPlaceholder } = require("langchain/prompts");
const { BufferMemory } = require("langchain/memory");
const { DynamicStructuredTool } = require ("langchain/tools");

// Telegram MTPROTO API Configuration
const {Api, TelegramClient} = require('telegram');
const {StringSession} = require('telegram/sessions');

const apiId = parseInt(process.env.TELE_API_ID!);
const apiHash = process.env.TELE_API_HASH;
const session = new StringSession(process.env.TELE_STR_SESSION);
const client = new TelegramClient(session, apiId, apiHash, {});


const searchTelegramMessages = async ({ query }:any) => {
	try {
		const result = await client.invoke(
		  new Api.messages.SearchGlobal({
			q: query,
			filter: new Api.InputMessagesFilterEmpty({}),
			minDate: -1,
			maxDate: -1,
			offsetRate: 0,
			offsetPeer: "usernames",
			offsetId: 0,
			limit: 5,
			folderId: 0,
		  })
		);
		return JSON.stringify(result);
	  } catch (error) {
		return JSON.stringify(error);
	  }
}

(async function run() {

	// Connect to the Telegram API
	await client.connect();
    
	// const openai = new OpenAIApi({
	// 	api_key: process.env.OPEN_AI_KEY
	// });

	const model = new ChatOpenAI({ temperature: 0 });
	const tools = [
		new Calculator(),
		
		new DynamicStructuredTool({
			name: "telegram-message-search",
			description: "Searches through all telegram chats for the given query",
			schema: z.object({
				query: z.string().describe("The search query, keep it brief and simple"),
			}),
			func: searchTelegramMessages
			}),
			

		new DynamicStructuredTool({
			name: "random-number-generator",
			description: "generates a random number between two input numbers",
			schema: z.object({
				low: z.number().describe("The lower bound of the generated number"),
				high: z.number().describe("The upper bound of the generated number"),
			}),
			func: async ({ low, high }) => {
				return "hi";
			}, // Outputs still must be strings
			returnDirect: false, // This is an option that allows the tool to return the output directly
			}),
	];

  	const executor = await initializeAgentExecutorWithOptions(tools, model, {
		agentType: "structured-chat-zero-shot-react-description",
		verbose: true,
		memory: new BufferMemory({
		memoryKey: "chat_history",
		returnMessages: true,
		}),
		agentArgs: {
		inputVariables: ["input", "agent_scratchpad", "chat_history"],
		memoryPrompts: [new MessagesPlaceholder("chat_history")],
		},
	});

	const result = await executor.call({ input: `Find me the latest post in the basket chatroom` });

	console.log(result);

	// const result2 = await executor.call({
	// 	input: `what is that number squared?`,
	// });

	// console.log(result2);

})();