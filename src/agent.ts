require('dotenv').config();

// Langchain Configuration
const { z } = require("zod");
const { ChatOpenAI } = require("langchain/chat_models/openai");
const { initializeAgentExecutorWithOptions } = require("langchain/agents");
const { Calculator } = require("langchain/tools/calculator");
const { MessagesPlaceholder } = require("langchain/prompts");
const { BufferMemory, BufferWindowMemory } = require("langchain/memory");
const { DynamicStructuredTool, AIPluginTool, SerpAPI } = require("langchain/tools");

const { VectorStoreRetrieverMemory } = require("langchain/memory");
const { LLMChain } = require("langchain/chains");
const { PromptTemplate } = require("langchain/prompts");
const { MemoryVectorStore } = require("langchain/vectorstores/memory");
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");

// Telegram MTPROTO API Configuration
const { Api, TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');

// DOM Parsing
const { JSDOM } = require("jsdom");
const axios = require("axios");

// Tools
const { GoogleCalendarViewTool, GoogleCalendarCreateTool } = require ('./tools/google-calendar/index.js');
const { TiktikAddTask, TiktikGetTasks } = require ('./tools/tiktik/index.js');

const { splitText } = require("./text-spitter.js");
const fs = require ("fs");
const yaml = require ("js-yaml");
const { createOpenApiAgent, OpenApiToolkit } = require ("langchain/agents");
const { JsonSpec, JsonObject }  = require ("langchain/tools");
const { createOpenAPIChain } = require ("langchain/chains");
const qs = require('qs');

// DEV Input
//const input = require("input"); // npm i input

var serpApi = new SerpAPI(process.env.SERPAPI_API_KEY, {
	location: "Brisbane, Queensland",
})
serpApi.verbose = (process.env.NODE_ENV === "production" ? false : true);
serpApi.description = "a search engine. useful for when you need to answer questions about current events. input should be a search query."

// Setup the OpenAI Model
var prompt_prefix = `You are a helpful AI assistant designed to manage telegram messages called TeleGPT. My name is Ryan Olsen.

If you can't find the answer using one tool you MUST use as many other tools 
as you can before deciding there is no answer. 

If needed try rewording search queries multiple times for better results. When you send a long response, please use dot points or emoji to make it easy to read. 
Format responses in telegram's MarkdownV2 format only if necessary.

Telegram chatrooms are used for storing all kinds of information and reports and templates, along with chats and users
Dropbox is used for storing only class recordings

If I ask you to send a message. Please make sure to confirm with me if the message and full name is correct every time before sending. 
If I have already said yes to an identical message before please don't reconfirm, just set confirmed=true and send it
When finding a userID or chatID to send the message to, firstly assume it's a userID and search my contacts. If there is no result, then you can search chat rooms for a chatID

If I ask for help to reply to a message or draft a response. Please first get the message history of the user's chat with me using chatroom

Word the messages in such as way as if I am sending it not yourself. Address people with "Anneyonghasimnikka" when writing messages. 
Keep messages simple and not over the top friendly. Don't use cute emoji

A "template" or "report" refers to a message on telegram that should be filled with information and sent to different chatrooms. 
If I ask you to fill a template, you can use the tool telegram-get-chatroom-history with ChatID: -4048857270 to find the template as a message. 
Then prompt me for the information needed to fill it and where to send it. Automatically fill any dates with the current date from running the tool get-date-time

If you are asked to schedules todos into the calendar, please first call tiktik-get-tasks to get a list of all tasks. Only include tasks that are due today, or have no due date
Then automatically approximate the duration of each. Next call google_calendar_view to find all the existing events for today. 
Then use google_calendar_create to create a calendar event with the same name as the todo task for each todo that can fit and not overlap an existing event. 
Prioritise based on priority of todo task. 

Only schedule tasks and events after the current time.`;
	
//var prefix_messages= [new SystemMessage(prompt_prefix)]
const model = new ChatOpenAI({
	temperature: 0.3,
	maxRetries: 10
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
	vectorStore: any;
	
	constructor(executor_client: any) {

		this.vectorStore = new MemoryVectorStore(new OpenAIEmbeddings());
		this.memory = new BufferWindowMemory( {
			k: 3,
			memoryKey: "chat_history",
			vectorStoreRetriever: this.vectorStore.asRetriever(1),
			returnMessages: true,
		});

		// Init all the tools
		this.setupTools();
	
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

		// await this.initTiktikAPI();
	}
	
	async run(query: string) {

		// Ensure the character limit isn't breached
		query = await splitText(query);

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
	
				// TODO: Remove try catch here, and do it properly by checking the user ID
				try {
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
				} catch (error) {
					return {
						"message_text": message.message,
						"message_date": message.date,
						"message_from": "N/A"
					}
				}
			});

			var string_result = JSON.stringify(formatted);
			return splitText(string_result);

		} catch (error: any) {
			if (process.env.NODE_ENV !== "production") console.log(error);
			if (error.code == 400) {
				if (process.env.NODE_ENV !== "production") console.log("Returning response")
				return JSON.stringify("The chat_id specified is wrong. If you're looking for a chatroom please use the telegram-chatroom-search tool to search for the chat_id again. If you're looking for a user / contact to reply to or message please use the telegram-search-contacts-list");
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

	searchContactsList = async ({ query }:any) => {
		var result = await this.client.invoke(
			new Api.contacts.Search({
				q: query,
				limit: 3,
			  })
		);

		const formattedUsers = result.users.map((user: any) => {
			const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A';
			const phoneNumber = user.phone || 'N/A';
			const userID = Number(user.id.value) || 'N/A';
			const chat_id = Number(user.id.value) || 'N/A'; // For compatibility with other tools which use chat_id
	
			return {
				fullName,
				phoneNumber,
				userID,
				chat_id
			};
		});
	
		// Limit the response to 400 characters
		var response = JSON.stringify(formattedUsers);
		if (response.length > 4000) {
			return response.slice(0, 4000);
		}
	
		return response;
	}

	sendTelegramMessage = async ({ userID, message, confirmed }: any) => {

		try {
			if (Number(userID) > 0){
				const id_check = await this.client.invoke(
					new Api.users.GetUsers({
					id: [userID],
					})
				);

				if (id_check[0].contact == false) {
					return "This userID=" + userID + " is not a trusted contact. Please try find a different user"
				}
			}
		} catch (error) {
			return "Couldn't find the userID specified. Please search for the correct userID"
		}

		if (confirmed == false) {
			return "If you have already confirmed a message the same as this one, please run telegram-send-message and set 'confirmed' to true. If this message was not confirmed before, please respond in this format: 'Before sending the message, could you please confirm if the following message is okay to send: /n {message} to user {full name}.'"
		}

		// console.log("SENT MESSAGE: " + message + " to: " + userID);
		try {
			var result = await this.client.sendMessage(BigInt(userID), { message: message });
		} catch (error) {
			console.log("Failed to send message with error: " + error);
			return "Couldn't send the message to userID=" + userID + " please use telegram-chatroom-or-user-search and telegram-search-contacts-list to find either a chatID or userID"
		}
		return "Message sent successfully. Please set confirmed=false for future messages"
	}

	// TODO: Remove this
	// confirmMessage = async ({ chat_id, message }: any) => {

	// 	return "Message confirmed, please send it now. The following message is ok to send: chat_id=" + chat_id + " message=" + message + " confirmed=true"

	// }
	
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

	getDateTime = async () => {

		const date_string = new Date().toISOString()
		const dayName = new Date().toLocaleString('en-us', { weekday: 'long' })
		
		let date = new Date(); 
		let hh = date.getHours();
		let mm = date.getMinutes();
		let ss = date.getSeconds();
		let session = "AM";
	  
		if(hh == 0){
			hh = 12;
		}
		if(hh > 12){
			hh = hh - 12;
			session = "PM";
		 }
					
		 let time = (hh < 10) ? "0" + hh : hh + ":" + (mm < 10) ? "0" + mm : mm + ":" + (ss < 10) ? "0" + ss : ss + " " + session;
		 var string_out = `Date format: YYYY-MM-DDThh:mm:ss+00:00
		 Today's datetime on UTC time ` + date_string + ` , it's ` + dayName + ` the timezone of the user +10, and the current time is: ` + time;

		return string_out
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
			new TiktikAddTask(),
			new TiktikGetTasks(),
		
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
				description: "Returns a history of the most recent messages in a given chatroom specified by chat_id or messages from a user given the userID. If asked to send a message to someone this can be useful to know what the previous messages were to reply to. Use this option ONLY if a 9 digit chat_id or userID is known. chat_id MUST be a negative number with 9 digits if you're looking for a chatroom. chat_id (userID) MUST be a positive number with 9 digits if you're looking for a user / contact. The output is message_text (contents of message), message_date (timestamp of messge), message_from (who sent it)",
				schema: z.object({
					chat_id: z.number().describe("The ID of the chatroom or the userID")
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
				name: "telegram-search-contacts-list",
				description: "Searches for a contact. The output is formatted full name, phone number, then a 9 digit userID for each contact",
				schema: z.object({
					query: z.string().describe("The search query, keep it brief and simple. Can't be empty"),
				}),
				func: this.searchContactsList
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

			// new DynamicStructuredTool({
			// 	name: "tiktik-todo-list",
			// 	description: "Used for anything relating to a todo list",
			// 	schema: z.object({
			// 		query: z.string().describe("A query for the open api chain relating to what you want to do with the todo list"),
			// 	}),
			// 	func: this.tiktikAPI
			// }),

			// new DynamicStructuredTool({
			// 	name: "telegram-send-message-confirm",
			// 	description: "If the user confirms a message is ok to send, run this first before running telegram-send-message",
			// 	schema: z.object({
			// 		userID: z.string().describe("The userID of the user to send the message to. It MUST be a positive number with 9 digits"),
			// 		message: z.string().describe("The message to send. Keep it brief and in a text message style"),
			// 	}),
			// 	func: this.confirmMessage
			// }),

			new DynamicStructuredTool({
				name: "telegram-send-message",
				description: "Sends a message to a telegram user directly. ONLY use this after you have checked if a message is ok to send. If you don't know the userID or chatID you must first use telegram-search-contacts-list to get the userID or telegram-chatroom-or-user-search to get the chatID of the user or chatroom you want to send to. You must never use this without first asking for confirmation about what you want to send.",
				schema: z.object({
					userID: z.string().describe("The userID or chatID of the user to send the message to. It MUST be a positive number with 9 digits"),
					message: z.string().describe("The message to send. Keep it brief and in a text message style"),
					confirmed: z.boolean().describe("True if the message has been agreed upon to be sent, false if the user hasn't agreed yet to let you send it")
				}),
				func: this.sendTelegramMessage
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
				name: "telegram-chatroom-or-user-search",
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
				name: "get-date-time",
				description: "Get's the current date and time right now",
				schema: z.object({}),
				func: this.getDateTime
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
