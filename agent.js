const { z } = ("zod");
// const { OpenAIApi } = require('openai');

const { ChatOpenAI } = require("langchain/chat_models/openai");
const { initializeAgentExecutorWithOptions } = require("langchain/agents");
const { Calculator } = require("langchain/tools/calculator");
const { MessagesPlaceholder } = require("langchain/prompts");
const { BufferMemory } = require("langchain/memory");
const { DynamicStructuredTool } = require ("langchain/tools");

require('dotenv').config();

(async function run() {

	// const openai = new OpenAIApi({
	// 	api_key: process.env.OPEN_AI_KEY
	// });

	const model = new ChatOpenAI({ temperature: 0 });
	const tools = [
		new Calculator(),
		new DynamicStructuredTool({
			name: "random-number-generator",
			description: "generates a random number between two input numbers",
			schema: z.object({
				low: z.number().describe("The lower bound of the generated number"),
				high: z.number().describe("The upper bound of the generated number"),
			}),
			func: async ({ low, high }) =>
			(Math.random() * (high - low) + low).toString(), // Outputs still must be strings
			returnDirect: false, // This is an option that allows the tool to return the output directly
		})
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

	const result = await executor.call({ input: `What is a random number between 5 and 10` });

	console.log(result);

	const result2 = await executor.call({
		input: `what is that number squared?`,
	});

	console.log(result2);

})();