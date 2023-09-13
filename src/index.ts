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
	const filter = new Api.InputMessagesFilterEmpty({});
	return await searchTelegramGlobal(query, filter);
}

const searchTelegramChatroomMessages = async ({ query, chat_id }:any) => {
	const filter = new Api.InputMessagesFilterEmpty({});
	return await searchTelegramByChat(query, filter, chat_id);
}

const searchForTelegramChatroom = async ({ query }:any) => {
	var result = await client.invoke(
        new Api.contacts.Search({
          q: query,
          limit: 5,
        })
      );

      const query_result = result.chats.map(chat => {
        return {
			"Title": chat.title,
			"ChatID": -Number(chat.id.value)
		}
      })

	  return query_result
}

const searchTelegramByChat = async (query:any, filter:any, chat_id:any) => {
	
	try {
		const result = await client.invoke(
			new Api.messages.Search({
			  q: query,
			  peer: BigInt(chat_id),
			  filter: filter,
			  minDate: -1,
			  maxDate: -1,
			  offsetRate: 0,
			  offsetPeer: "username",
			  offsetId: 0,
			  limit: 20,
			  folderId: 0,
			})
		  );		

		return JSON.stringify(formatChatSearchResults(result));
	  } catch (error) {
		return JSON.stringify(error);
	  }

}

const searchTelegramGlobal = async (query:any, filter:any) => {
	try {
		const result = await client.invoke(
			new Api.messages.SearchGlobal({
			  q: query,
			  filter: new Api.InputMessagesFilterEmpty({}),
			  minDate: -1,
			  maxDate: -1,
			  offsetRate: 0,
			  offsetPeer: "username",
			  offsetId: 0,
			  limit: 2,
			  folderId: 0,
			})
		  );
	
		

		return JSON.stringify(formatChatSearchResults(result));
	  } catch (error) {
		return JSON.stringify(error);
	  }
}

const formatChatSearchResults = async (result: any) => {
	const query_result = result.messages.map(message => {
		//result.users.find(user => user.id === message.fromId)?.username || 'N/A';
		
		var username:string = "";
		var chat:string;
		var messageText:string;

		// Check if peerId has channelId, otherwise, set chat to 'N/A'
		if (message.peerId.className == "PeerChannel") {
		   chat = result.chats.find(chat => chat.id.value === message.peerId.channelId.value).title

		   if (message.fromId.className == "PeerUser") {
				const user = result.users.find(user => user.id.value === message.fromId.userId.value)
				const firstName = user?.firstName || 'N/A';
				const lastName = user?.lastName || '';

				// Create the username by combining firstName and lastName
				username = (firstName && lastName) ? `${firstName} ${lastName}` : firstName || lastName || 'N/A';

		   }
		} else {
				chat = "N/A"
				const user = result.users.find(user => user.id.value === message.peerId.userId.value)
				const firstName = user?.firstName || 'N/A';
				const lastName = user?.lastName || '';

				// Create the username by combining firstName and lastName
				username = (firstName && lastName) ? `${firstName} ${lastName}` : firstName || lastName || 'N/A';

		}

		// Define a maximum messageText length (e.g., 100 characters)
		const maxMessageTextLength = 100;
		messageText = message.message || '';

		// Truncate messageText if it exceeds the maximum length
		if (messageText.length > maxMessageTextLength) {
		messageText = messageText.slice(0, maxMessageTextLength) + '...';
		}
			  
		return {
		  username,
		  chat,
		  messageText,
		};
	  });
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
			name: "telegram-message-search-global",
			description: "Searches through all telegram chats for the given query and returns the results in order of relevance",
			schema: z.object({
				query: z.string().describe("The search query, keep it brief and simple"),
			}),
			func: searchTelegramMessages
			}),

		new DynamicStructuredTool({
			name: "telegram-message-search-by-chatroom",
			description: "Searches through a specific telegram chatroom for the given query and returns the results in order of relevance. Use this instead of the telegram-message-search-global option if a chat ID is given. Chat ID MUST be given as a negative 8-10 digit number otherwise don't use this one",
			schema: z.object({
				query: z.string().describe("The search query, keep it brief and simple"),
				chat_id: z.number().describe("The ID of the chatroom. It should be a negative number with about 9 digits")
			}),
			func: searchTelegramChatroomMessages
			}),

		new DynamicStructuredTool({
			name: "telegram-chatroom-search",
			description: "Searches telegram chatrooms by query and will return the name of the chatrooms and their corresponding ID in order of relevance",
			schema: z.object({
				query: z.string().describe("The search query, keep it brief and simple"),
			}),
			func: searchForTelegramChatroom
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

	const result = await executor.call({ input: `Find me the latest post in my 152 basket` });

	console.log(result);

	// const result2 = await executor.call({
	// 	input: `what is that number squared?`,
	// });

	// console.log(result2);

})();