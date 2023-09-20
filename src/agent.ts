require('dotenv').config();

// Langchain Configuration
const { z } = require("zod");
const { ChatOpenAI } = require("langchain/chat_models/openai");
const { initializeAgentExecutorWithOptions } = require("langchain/agents");
const { Calculator } = require("langchain/tools/calculator");
const { MessagesPlaceholder } = require("langchain/prompts");
const { BufferMemory } = require("langchain/memory");
const { DynamicStructuredTool } = require("langchain/tools");
const { SerpAPI } = require ("langchain/tools");

// Telegram MTPROTO API Configuration
const { Api, TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');

// DOM Parsing
const { JSDOM } = require("jsdom");
const axios = require("axios");

// Tools
const { GoogleCalendarViewTool, GoogleCalendarCreateTool } = require ('./tools/google-calendar/index.ts');

// DEV Input
//const input = require("input"); // npm i input

var serpApi = new SerpAPI(process.env.SERPAPI_API_KEY, {
	location: "Brisbane, Queensland",
})
serpApi.verbose = (process.env.NODE_ENV === "production" ? false : true);
serpApi.description = "a search engine. useful for when you need to answer questions about current events. input should be a search query."

// Setup the OpenAI Model
var prompt_prefix = `You are a helpful AI assistant designed to manage telegram messages. 
My name is Ryan. If you can't find the answer using one tool you MUST use as many other tools 
as you can before deciding there is no answer. If needed try reqording search queries multiple times 
for better results. When you send a long response, please use dot points or emoji to make it easy to read. 
Format responses in telegram's MarkdownV2 format.
Telegram chatrooms are used for storing all kinds of information and reports, along with chats
Dropbox is used for storing only scripts, presentations and class recordings, though these are often also found in telegram chatrooms`;
	
//var prefix_messages= [new SystemMessage(prompt_prefix)]
const model = new ChatOpenAI({
	temperature: 0.3
});

// Google Calendar Auth
const googleCalendarParams = {
	credentials: {
	  clientEmail: process.env.CLIENT_EMAIL,
	  privateKey: process.env.PRIVATE_KEY,
	  calendarId: process.env.CALENDAR_ID
	},
	scopes: [
	  'https://www.googleapis.com/auth/calendar',
	  'https://www.googleapis.com/auth/calendar.events'
	]
  }
class Agent {
	memory: any;
	executor: any;
	dateLimit: number;
	client: any;
	tools: any[];
	
	constructor(executor_client: any) {

		this.memory = new BufferMemory({
			memoryKey: "chat_history",
			returnMessages: true,
		});

		// Init all the tools
		this.setupTools();
	
		// // Init the executor
		// this.executor = initializeAgentExecutorWithOptions(this.tools, model, {
		// 	agentType: "openai-functions", //"structured-chat-zero-shot-react-description",
		// 	verbose: process.env.NODE_ENV === "production" ? false : true,
		// 	memory: this.memory,
		// 	agentArgs: {
		// 		prefix: prompt_prefix,
		// 		inputVariables: ["input", "agent_scratchpad", "chat_history"],
		// 		memoryPrompts: [new MessagesPlaceholder("chat_history")],
		// 	},
		// 	handleParsingErrors: "Please try again, paying close attention to the allowed enum values",
		// });
	
		this.dateLimit = Math.floor(Date.now() / 1000);

		this.client = executor_client;
	}

	async init() {
		// Init the executor
		this.executor = await initializeAgentExecutorWithOptions(this.tools, model, {
			agentType: "openai-functions", //"structured-chat-zero-shot-react-description",
			verbose: process.env.NODE_ENV === "production" ? false : true,
			memory: this.memory,
			agentArgs: {
				prefix: prompt_prefix,
				inputVariables: ["input", "agent_scratchpad", "chat_history"],
				memoryPrompts: [new MessagesPlaceholder("chat_history")],
			},
			handleParsingErrors: "Please try again, paying close attention to the allowed enum values",
		});
	}
	
	async run(query: string) {
		const result = await this.executor.call({ input: query });
		return result;
	};

	searchForTelegramChatroom = async ({ query }: any) => {
		var result = await this.client.invoke(
			new Api.contacts.Search({
				q: query,
				limit: 5,
			})
		);
	
		if (process.env.NODE_ENV !== "production") console.log(result);
	
		const query_result: any = result.chats.map((chat: any) => {
			return {
				"Title": chat.title,
				"ChatID": -Number(chat.id.value)
			}
		})

		var string_result = JSON.stringify(query_result[0]);
		if (query_result[0] === undefined) {
			string_result = "No results were found for that search. Try run this tool again after rewording the query & fixing spelling";
		}
	
		return JSON.stringify(string_result)
	}
	
	searchTelegramByChat = async ({ query, chat_id }: any) => {
		const filter = new Api.InputMessagesFilterEmpty({});
	
		if (process.env.NODE_ENV !== "production") console.log(query);
		if (process.env.NODE_ENV !== "production") console.log(chat_id);
	
		try {
			const result = await this.client.invoke(
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
	
			return await this.formatChatSearchResults(result);
		} catch (error: any) {
			if (process.env.NODE_ENV !== "production") console.log(error);
			if (error.code == 400) {
				return "The chat_id specified is wrong. Please use the telegram-chatroom-search tool to search for the chat_id again"
			}
			return JSON.stringify(error);
		}
	}
	
	getVerseContents = async ({ verse, version }: any) => {
	
		const url = `https://www.biblegateway.com/passage?search=${verse}&version=${version}`;
		const result = await axios.get(url);
		const document = new JSDOM(result.data).window.document;
		version = version || "NIV"; // Default the version to NIV
	
		if (process.env.NODE_ENV !== "production") console.log(document);
		const verse_name = document.querySelector(".dropdown-display-text")?.textContent;
		let elements = [].slice.call(document.querySelectorAll(".std-text"));
	
		if (process.env.NODE_ENV !== "production") console.log(document.querySelectorAll(".std-text")[0]);
		let content = [];
		for (let i = 0; i < elements.length; i++) {
			const element = elements[i] as HTMLElement;
			let text = element.textContent;
			if (text && text.slice(0, 4) != "Back")
				content.push(text);
		}
		if (content.length === 0) {
			return "No results for the given verse"
		}
	
		return "Here is the verse. Please DO NOT explain it in any way, just reply with the verse as is: " + JSON.stringify({
			verse: verse_name,
			contents: content
		});
	}
	
	searchDropbox = async ({ query, type }:any) => {
	
		// Account for blank type tags (there's probably a nicer way to do this but ehh)
		var data;
		if (type == "") {
			data = JSON.stringify({
				"query": query,
				"options": {
					"max_results": 10,
					"order_by": {
						".tag": "relevance"
					},
					"file_status": {
						".tag": "active"
					}					
				}
			})
		} else {
			JSON.stringify({
				"query": query,
				"options": {
					"max_results": 10,
					"order_by": {
						".tag": "relevance"
					},
					"file_status": {
						".tag": "active"
					},
					"file_categories":[{
						".tag": type
					}]	
				}
			})
		}

		// Run a search query
		var config = {
			method: 'post',
			url: 'https://api.dropboxapi.com/2/files/search_v2',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + process.env.DROPBOX_API
			},
			data: data
		};
	
		const response = await axios.request(config)
		
		if (response.data.matches.length < 1) {
			if (process.env.NODE_ENV !== "production") console.log("No serach results found");
			return "No files found for the search request. Maybe try searching all chat rooms instead";
		}
		
		// For each of the search results, run a request to get the share link				
		const formattedResponse = await  Promise.all(response.data.matches.map(async (match: any): Promise<object> => {
			let file_name = "None found";
			let type = "None found";
			let last_modified = "None found";
			let url = "None found";
	
			const fileMetadata = match.metadata.metadata;
	
			let config2 = {
				method: 'post',
				url: 'https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + process.env.DROPBOX_API
				},
				validateStatus: function() {return true;}, // Stop Axios errors, we'll handle them ourselves
				data: JSON.stringify({ "path": fileMetadata.path_display })
			};
	
			var shareUrl = "No share link could be found";
	
			const response = await axios.request(config2);
			var data = response.data;
	
			// Format the response to just extract the share url
			if (data && data.url) {
				shareUrl = data.url;
			} else if (
				// If the share link already exists, the response format is a bit different
				data &&
				data.error &&
				data.error.shared_link_already_exists &&
				data.error.shared_link_already_exists.metadata &&
				data.error.shared_link_already_exists.metadata.url
			) {
				shareUrl = data.error.shared_link_already_exists.metadata.url;
			}
	
			// Set the return variables
			file_name = fileMetadata.name;
			type = fileMetadata['.tag'];
			last_modified = fileMetadata.client_modified;
			url = shareUrl;
	
			return {
				"file_name": file_name,
				"type": type,
				"last_modified": last_modified,
				"url": url,
			};
		}));
		
		if (process.env.NODE_ENV !== "production") console.log(formattedResponse)
		return JSON.stringify(formattedResponse);
	}
	
	getChatHistory = async ({ chat_id }: any) => {
		try {
			var result = await this.client.invoke(
				new Api.messages.GetHistory({
					peer: BigInt(chat_id),
					offsetId: 0,
					offsetDate: 0,
					addOffset: 0,
					limit: 35,
					maxId: 0,
					minId: 0,
					hash: BigInt("-4156887774564"),
				})
			);
	
			if (process.env.NODE_ENV !== "production") console.log("HISTORY");
			if (process.env.NODE_ENV !== "production") console.log(result);
	
			const formatted = result.messages.map((message: any) => {
	
				// Find the user who sent the message
				var user = result.users.find((user: any) => message.fromId.userId.value == user.id)
	
				// Compute their username
				const firstName = user?.firstName || 'N/A';
				const lastName = user?.lastName || '';
	
				// Create the username by combining firstName and lastName
				const username = (firstName && lastName) ? `${firstName} ${lastName}` : firstName || lastName || 'N/A'
	
				return {
					"message_text": message.message,
					"message_date": message.date,
					"message_from": username
				}
			});
	
			return JSON.stringify(formatted);
		} catch (error: any) {
			if (process.env.NODE_ENV !== "production") console.log(error);
			if (error.code == 400) {
				if (process.env.NODE_ENV !== "production") console.log("Returning response")
				return JSON.stringify("The chat_id specified is wrong. Please use the telegram-chatroom-search tool to search for the chat_id again");
			}
			return JSON.stringify(error);
		}
	}
	
	getUnreadMessages = async ({ }: any) => {
		try {
			var result = await this.client.invoke(
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
			var filteredDialogs = result.dialogs.filter((dialog: any) => {
				var message = result.messages.find((message: any) => message.id === dialog.topMessage);
				return (message.date > this.dateLimit && dialog.unreadCount > 0);
			});
	
			if (process.env.NODE_ENV !== "production") console.log("Filtered:");
			if (process.env.NODE_ENV !== "production") console.log(filteredDialogs);
	
			var mapped = filteredDialogs.map((dialog: any) => {
				var chat;
				var message = result.messages.find((message: any) => message.id === dialog.topMessage).message;
	
				var username = "Unknown Chat";
				var chat_id = 0;
	
				switch (dialog.peer.className) {
					case 'PeerChannel':
						chat = result.chats.find((chat: any) => chat.id.value === dialog.peer.channelId.value);
						chat_id = -Number(chat.id.value);
						break;
	
					case 'PeerUser':
						var user = result.users.find((user: any) => user.id.value === dialog.peer.userId.value);
	
						const firstName = user?.firstName || 'N/A';
						const lastName = user?.lastName || '';
	
						// Create the username by combining firstName and lastName
						username = (firstName && lastName) ? `${firstName} ${lastName}` : firstName || lastName || 'N/A';
	
						chat_id = Number(dialog.peer.userId.value);
						break;
	
					case 'PeerChat':
						chat = result.chats.find((chat: any) => chat.id.value === dialog.peer.chatId.value);
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
	
			if (process.env.NODE_ENV !== "production") console.log("Mapped:");
			if (process.env.NODE_ENV !== "production") console.log(mapped);
	
			// Update the dateLimit so next time this function is run it will give new unread messages
			// TODO: Make this value persistent
			this.dateLimit = Math.floor(Date.now() / 1000);
	
			return JSON.stringify(mapped);
		} catch (error) {
			return JSON.stringify(error);
		}
	}
	
	getContactsList = async () => {
		var result = await this.client.invoke(
			new Api.contacts.GetContacts({})
		);
	
		const formattedUsers = result.users.map((user: any) => {
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
	
		return response;
	}
	
	getChatroomAndMessage = async ({ chatroom_query, message_query }: any) => {
	
		if (process.env.NODE_ENV !== "production") console.log(chatroom_query);
		var chatroom = JSON.parse(await this.searchForTelegramChatroom({ "query": chatroom_query })).ChatID;
		var message = await this.searchTelegramByChat({ "query": message_query, "chat_id": chatroom })
	
		return message;
	}
	
	searchTelegramGlobal = async ({ query }: any) => {
		const filter = new Api.InputMessagesFilterEmpty({});
	
		try {
			const result = await this.client.invoke(
				new Api.messages.SearchGlobal({
					q: query,
					filter: filter,
					minDate: -1,
					maxDate: -1,
					offsetRate: 0,
					offsetPeer: "username",
					offsetId: 0,
					limit: 4,
					folderId: 0,
				})
			);
	
			return await this.formatChatSearchResults(result);
		} catch (error: any) {
			if (process.env.NODE_ENV !== "production") console.log(error);
			return JSON.stringify(error);
		}
	}
	
	formatChatSearchResults = async (result: any) => {
	
		if (process.env.NODE_ENV !== "production") console.log(result);
	
		const query_result = result.messages.map((message: any) => {
			//result.users.find(user => user.id === message.fromId)?.username || 'N/A';
	
			try {
				var username: string = "";
				var chat: string = "";
				var messageText: string = "";
	
				// Check if peerId has channelId, otherwise, set chat to 'N/A'
				if (message.peerId.className == "PeerChannel") {
					chat = result.chats.find((chat: any) => chat.id.value === message.peerId.channelId.value).title;
				}
	
				else if (message.peerId.className == "PeerUser") {
					const user = result.users.find((user: any) => user.id.value === message.peerId.userId.value)
					const firstName = user?.firstName || 'N/A';
					const lastName = user?.lastName || '';
					chat = "N/A";
	
					// Create the username by combining firstName and lastName
					username = (firstName && lastName) ? `${firstName} ${lastName}` : firstName || lastName || 'N/A';
	
				} else {
					const user = result.users.find((user: any) => user.id.value === message.peerId.userId.value)
					const firstName = user?.firstName || 'N/A';
					const lastName = user?.lastName || '';
					chat = result.chats.find((chat: any) => chat.id.value === message.peerId.channelId.value).title;
	
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
			} catch (error) {
				console.log(error);
				return JSON.stringify(error);
			}
		});
	
		if (process.env.NODE_ENV !== "production") console.log("QUERY:")
		if (process.env.NODE_ENV !== "production") console.log(query_result.reverse());
	
		return JSON.stringify(query_result.reverse());
	}

	// Setup the custom tools
	setupTools(){
		this.tools = [
			new Calculator(),

			new GoogleCalendarCreateTool(googleCalendarParams),
    		new GoogleCalendarViewTool(googleCalendarParams),
		
			new DynamicStructuredTool({
				name: "telegram-message-search-global",
				description: "Searches through all telegram chats for the given query and returns the results in order of relevance",
				schema: z.object({
					query: z.string().describe("The search query, keep it brief and simple"),
				}),
				func: this.searchTelegramGlobal
			}),
		
			new DynamicStructuredTool({
				name: "telegram-get-chatroom-history",
				description: "Returns a history of the most recent messages in a given chatroom specified by chat_id. Use this option ONLY if a 9 digit chat_id from telegram-chatroom-search is known. chat_id MUST be given as a negative 9 digit number. The output is message_text (contents of message), message_date (timestamp of messge), message_from (who sent it)",
				schema: z.object({
					chat_id: z.number().describe("The ID of the chatroom. It MUST be a negative number with 9 digits")
				}),
				func: this.getChatHistory
			}),
		
			new DynamicStructuredTool({
				name: "get-bible-verse",
				description: "Searches a bible verse and returns the contents of the verse",
				schema: z.object({
					verse: z.string().describe("The bible verse in the correct format"),
					version: z.string().default("NIV").describe("The version code of the bible to use, defult should be NIV")
				}),
				func: this.getVerseContents
			}),
		
			new DynamicStructuredTool({
				name: "telegram-get-contacts-list",
				description: "Gets a list of all contacts. The output is formatted full name, phone number, then a 9 digit userID for each contact",
				schema: z.object({}),
				func: this.getContactsList
			}),
		
			new DynamicStructuredTool({
				name: "telegram-get-unread-messages",
				description: "Gets a list of all unread messages and recent updates. Only unread messages are shown. Only use this if specifically unread messages are needed. The output is formatted title (title of the chat room the message is in), chat_id which is the 9 digit ID of the chat, and number_unread which is how many unread messages there are, finally top_messaage is the most recent unread message content in that chat room",
				schema: z.object({}),
				func: this.getUnreadMessages
			}),
		
			new DynamicStructuredTool({
				name: "telegram-get-chatroom-and-search",
				description: "Firstly searches for a chatroom and it's messages using chatroom_query then in that chatroom search for a message using message_query",
				schema: z.object({
					chatroom_query: z.string().describe("The search query for finding the chatroom to look in"),
					message_query: z.string().describe("The search query for what to search for after the chatroom is firstly found"),
				}),
				func: this.getChatroomAndMessage
			}),
		
			new DynamicStructuredTool({
				name: "telegram-message-search-by-chatroom",
				description: "Searches through a specified telegram chatroom for the given query and returns the results in order of relevance. Use this option ONLY if a 9 digit chat_id from telegram-chatroom-search is known. chat_id MUST be given as a negative 9 digit number. Query can't be blank",
				schema: z.object({
					query: z.string().describe("The search query, keep it brief and simple. Can't be empty"),
					chat_id: z.number().describe("The ID of the chatroom. It MUST be a negative number with 9 digits")
				}),
				func: this.searchTelegramByChat
			}),
		
			new DynamicStructuredTool({
				name: "telegram-chatroom-search",
				description: "Searches for a chat_ID for a chatroom (9 digit chat ID) based off a serach query",
				schema: z.object({
					query: z.string().describe("The search query, keep it brief and simple"),
				}),
				func: this.searchForTelegramChatroom
			}),
		
			new DynamicStructuredTool({
				name: "search-dropbox",
				description: "Only use this if other options had no results. Dropbox is used for sotring class recordings. Use this to search dropbox for a recording. Only words you would find in a file name. The output is multiple responses in order of relevance",
				schema: z.object({
					query: z.string().describe("The search query, keep it brief and simple"),
					type: z.enum(["", "image", "video", "document", "pdf", "folder", "presentation"]).default("").describe("The type of resource to search for"),
				}),
				func: this.searchDropbox
			}),
		
			new DynamicStructuredTool({
				name: "end-conversation",
				description: "When it seems like the conversation has ended and a new topic will be discussed this should be run first to reset the history. If you want to continue answering the user's prompt after reset, send a prompt to the optional prompt option",
				schema: z.object({
					prompt: z.string().default("This is a messge from yourself. Your memory has just been reset").describe("If resetting memory will make you forget what you need to do, put the prompt here"),
				}),
				func: this.resetMemory 
			}),
		
			// For google searches
			serpApi
		];
	}

	resetMemory = async ({prompt}:any) => {
		console.log("*** Reseting Memory ***");
		this.memory.clear();
		this.run(prompt);
	}
}

module.exports = Agent;
