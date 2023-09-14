require('dotenv').config();
// const { OpenAIApi } = require('openai');

// Langchain Configuration
const { z } = require("zod");
const { ChatOpenAI } = require("langchain/chat_models/openai");
const { initializeAgentExecutorWithOptions } = require("langchain/agents");
const { Calculator } = require("langchain/tools/calculator");
const { MessagesPlaceholder } = require("langchain/prompts");
const { SystemMessage } = require("langchain/schema");
const { BufferMemory } = require("langchain/memory");
const { DynamicStructuredTool } = require ("langchain/tools");
const { PlanAndExecuteAgentExecutor } = require ("langchain/experimental/plan_and_execute");

// Telegram MTPROTO API Configuration
const {Api, TelegramClient} = require('telegram');
const {StringSession} = require('telegram/sessions');

const apiId = parseInt(process.env.TELE_API_ID!);
const apiHash = process.env.TELE_API_HASH;
const session = new StringSession(process.env.TELE_STR_SESSION);
const client = new TelegramClient(session, apiId, apiHash, {});

var dateLimit = 1694662783; //Math.floor(Date.now()/1000);

// DEV Input
const input = require("input"); // npm i input

const searchForTelegramChatroom = async ({ query }:any) => {
	var result = await client.invoke(
        new Api.contacts.Search({
          q: query,
          limit: 5,
        })
      );

	  console.log(result);

      const query_result:object = result.chats.map(chat => {
        return {
			"Title": chat.title,
			"ChatID": -Number(chat.id.value)
		}
      })

	  return JSON.stringify(query_result[0])
}

const searchTelegramByChat = async ({ query, chat_id }:any) => {
	const filter = new Api.InputMessagesFilterEmpty({});

	console.log("DEBUG ******************************************************************")
	console.log(query);
	console.log(chat_id);
	
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

		return JSON.stringify(await formatChatSearchResults(result));
	  } catch (error) {
		if (error.code == 400) {
			return "The chat_id specified is wrong. Please use the telegram-chatroom-search tool to search for the chat_id again"
		}
		return JSON.stringify(error);
	  }
}

const getChatHistory = async ({chat_id}:any) => {
	try{
	  var result = await client.invoke(
		new Api.messages.GetHistory({
		  peer: new Api.InputPeerChat({
			chatId: Number(chat_id)
		  }),
		  offsetId: 0,
		  offsetDate: 0,
		  addOffset: 0,
		  limit: 35,
		  maxId: 0,
		  minId: 0,
		  hash: BigInt("-4156887774564"),
		})
	  );
	
	  var formatted = result.messages.map(async (message) => {
	
		// Find the user who sent the message
		var user = result.users.find(user => result.messages[0].fromId.userId.value == user.id)
	
		// Compute their username
		const firstName = user?.firstName || 'N/A';
		const lastName = user?.lastName || '';
	
		// Create the username by combining firstName and lastName
		const username = (firstName && lastName) ? `${firstName} ${lastName}` : firstName || lastName || 'N/A'
	
		return {
			message_text: message.message,
			message_date: message.date,
			message_from: username
		}
	  });

	  return JSON.stringify(formatted);
	} catch (error) {
		return JSON.stringify(error); // Let GPT interpret it how it likes
	}
}

const getUnreadMessages = async ({ }:any) => {
	try {
		var result = await client.invoke(
			new Api.messages.GetDialogs({
			  offsetDate: 0,
			  offsetId: 0,
			  offsetPeer: "username",
			  limit: 40,
			  hash: BigInt("-4156887774564"),
			  excludePinned: true,
			  folderId: 0,
			})
		  );

		// Remove already read dates
		var filteredDialogs = result.dialogs.filter(dialog => {
			var message = result.messages.find(message => message.id === dialog.topMessage);
			return (message.date > dateLimit && dialog.unreadCount > 0);
		});

		console.log("Filtered:");
		console.log(filteredDialogs);

		var mapped = filteredDialogs.map(dialog => {
			var chat;
			var message = result.messages.find(message => message.id === dialog.topMessage).message;

			var username = "Unknown Chat";
			var chat_id = 0;
			
			switch (dialog.peer.className) {
				case 'PeerChannel':
					chat = result.chats.find(chat => chat.id.value === dialog.peer.channelId.value);
					chat_id = -Number(chat.id.value);
					break;

				case 'PeerUser':
					var user = result.users.find(user => user.id.value === dialog.peer.userId.value);

					const firstName = user?.firstName || 'N/A';
					const lastName = user?.lastName || '';

					// Create the username by combining firstName and lastName
					username = (firstName && lastName) ? `${firstName} ${lastName}` : firstName || lastName || 'N/A';

					chat_id = Number(dialog.peer.userId.value);
					break;

				case 'PeerChat':
					chat = result.chats.find(chat => chat.id.value === dialog.peer.chatId.value);
					chat_id = -Number(chat.id.value);
					break;

				default:
					chat = null; // Handle any other cases as needed
					break;
			}
			
			return {
				"Title": chat ? chat.title : username,
				"chat_id": chat_id, // Default chat_id value
				"number_unread": dialog.unreadCount, // Default top_message_id value
				"top_messaage": message
			};
		});

		console.log("Mapped:");
		console.log(mapped);

		// Update the dateLimit so next time this function is run it will give new unread messages
		// TODO: Make this value persistent
		//dateLimit = Math.floor(Date.now()/1000);

		return JSON.stringify(mapped);
	  } catch (error) {
		return JSON.stringify(error);
	  }
}

const getContactsList = async ({ query }:any) => {
	var result = await client.invoke(
		new Api.contacts.GetContacts({})
	);
	
	const formattedUsers = result.users.map(user => {
		const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A';
		const phoneNumber = user.phone || 'N/A';
		const userID = Number(user.id.value) || 'N/A';
	  
		return {
		  fullName,
		  phoneNumber,
		  userID,
		};
	  });

	  // Limit the response to 400 characters
	  var response = JSON.stringify(formattedUsers);
		if (response.length > 4000) {
			return response.slice(0, 4000);
		}

	  return JSON.stringify(response);
}

const getChatroomAndMessage = async ({ chatroom_query, message_query }:any) => {

	console.log(chatroom_query);
	var chatroom = JSON.parse(await searchForTelegramChatroom({"query": chatroom_query})).ChatID;
	var message = await searchTelegramByChat({"query": message_query, "chat_id": chatroom})

	return message;
}

const searchTelegramGlobal = async ({ query }:any) => {
	const filter = new Api.InputMessagesFilterEmpty({});

	try {
		const result = await client.invoke(
			new Api.messages.SearchGlobal({
			  q: query,
			  filter: filter,
			  minDate: -1,
			  maxDate: -1,
			  offsetRate: 0,
			  offsetPeer: "username",
			  offsetId: 0,
			  limit: 2,
			  folderId: 0,
			})
		  );
	
		return JSON.stringify(await formatChatSearchResults(result));
	  } catch (error) {
		return JSON.stringify(error);
	  }
}

const formatChatSearchResults = async (result: any) => {

	console.log(result);

	const query_result = result.messages.map(message => {
		//result.users.find(user => user.id === message.fromId)?.username || 'N/A';
		
		try {
			var username:string = "";
			var chat:string = "";
			var messageText:string = "";

			// Check if peerId has channelId, otherwise, set chat to 'N/A'
			if (message.peerId.className == "PeerChannel") {
				chat = result.chats.find(chat => chat.id.value === message.peerId.channelId.value).title;
			}

			else if (message.fromId.className == "PeerUser") {
					const user = result.users.find(user => user.id.value === message.fromId.userId.value)
					const firstName = user?.firstName || 'N/A';
					const lastName = user?.lastName || '';

					// Create the username by combining firstName and lastName
					username = (firstName && lastName) ? `${firstName} ${lastName}` : firstName || lastName || 'N/A';

			} else {
					chat = "N/A"
					const user = result.users.find(user => user.id.value === message.peerId.userId.value)
					const firstName = user?.firstName || 'N/A';
					const lastName = user?.lastName || '';

					// Create the username by combining firstName and lastName
					username = (firstName && lastName) ? `${firstName} ${lastName}` : firstName || lastName || 'N/A';

			}

			// Define a maximum messageText length (e.g., 100 characters)
			const maxMessageTextLength = 400;
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
		} catch (error) {}
	  });

	  console.log("QUERY:")
	  console.log(query_result);

	return query_result.reverse();
}

(async function() {

	// Connect to the Telegram API
	await client.connect();

	//var prefix_messages= [new SystemMessage(prompt_prefix)]
	const model = new ChatOpenAI({ 
		temperature: 0.1
	});
	
	// Setup the custom tools
	const tools = [
		new Calculator(),
		
		new DynamicStructuredTool({
			name: "telegram-message-search-global",
			description: "Searches through all telegram chats for the given query and returns the results in order of relevance",
			schema: z.object({
				query: z.string().describe("The search query, keep it brief and simple"),
			}),
			func: searchTelegramGlobal
		}),
		
		new DynamicStructuredTool({
			name: "telegram-get-chatroom-history",
			description: "Returns a history of the most recent messages in a given chatroom specified by chat_id. Use this option ONLY if a 9 digit chat_id from telegram-chatroom-search is known. chat_id MUST be given as a negative 9 digit number.",
			schema: z.object({
				chat_id: z.number().describe("The ID of the chatroom. It MUST be a negative number with 9 digits")
			}),
			func: getChatHistory
		}),

		new DynamicStructuredTool({
			name: "telegram-get-contacts-list",
			description: "Gets a list of all contacts. The output is formatted full name, phone number, then a 9 digit userID for each contact",
			schema: z.object({}),
			func: getContactsList
		}),

		new DynamicStructuredTool({
			name: "telegram-get-unread-messages",
			description: "Gets a list of all unread messages and recent updates. The output is formatted title (title of the chat room the message is in), chat_id which is the 9 digit ID of the chat, and number_unread which is how many unread messages there are, finally top_messaage is the most recent unread message content in that chat room",
			schema: z.object({}),
			func: getUnreadMessages
		}),

		new DynamicStructuredTool({
			name: "telegram-get-chatroom-and-search",
			description: "Firstly search for a chatroom using chatroom_query then in that chatroom search for a message using message_query",
			schema: z.object({
				chatroom_query: z.string().describe("The search query for finding the chatroom to look in"),
				message_query: z.string().describe("The search query for what to search for after the chatroom is firstly found"),
			}),
			func: getChatroomAndMessage
		}),

		new DynamicStructuredTool({
			name: "telegram-message-search-by-chatroom",
			description: "Searches through a specified telegram chatroom for the given query and returns the results in order of relevance. Use this option ONLY if a 9 digit chat_id from telegram-chatroom-search is known. chat_id MUST be given as a negative 9 digit number. Query can't be blank",
			schema: z.object({
				query: z.string().describe("The search query, keep it brief and simple. Can't be empty"),
				chat_id: z.number().describe("The ID of the chatroom. It MUST be a negative number with 9 digits")
			}),
			func: searchTelegramByChat
		}),

		new DynamicStructuredTool({
			name: "telegram-chatroom-search",
			description: "Searches telegram chatrooms by query and will return the name of the chatrooms and their corresponding 9 digit chat ID",
			schema: z.object({
				query: z.string().describe("The search query, keep it brief and simple"),
			}),
			func: searchForTelegramChatroom
		}),
	];

	// Setup the OpenAI Model
	var prompt_prefix = `You are a helpful AI assistant designed to manage telegram messages. My name is Ryan. If you can't find the answer using one tool you MUST use as many other tools as you can before deciding there is no answer`;

  	const executor = await initializeAgentExecutorWithOptions(tools, model, {
		agentType: "openai-functions", //"structured-chat-zero-shot-react-description",
		verbose: true,
		memory: new BufferMemory({
			memoryKey: "chat_history",
			returnMessages: true,
		}),
		agentArgs: {
			prefix: prompt_prefix,
      		inputVariables: ["input", "agent_scratchpad", "chat_history"],
			memoryPrompts: [new MessagesPlaceholder("chat_history")],
		},
	});

	module.exports.runQuery = async function(query:string) {
		return await run(executor, query);
	}
})()

async function run(executor:any, query:string) {
	const result = await executor.call({ input: query });
	return result;
};