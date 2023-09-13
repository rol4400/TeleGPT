const {Api, TelegramClient} = require('telegram');
const {StringSession} = require('telegram/sessions');

require('dotenv').config();

// Telegram MTPROTO API Configuration
const apiId = parseInt(process.env.TELE_API_ID);
const apiHash = process.env.TELE_API_HASH;
const session = new StringSession(process.env.TELE_STR_SESSION);
const client = new TelegramClient(session, apiId, apiHash, {});

// OpenAI Environment Setup
import { OpenAI } from "langchain/llms/openai";

const llm = new OpenAI({
  openAIApiKey: process.env.OPEN_AI_KEY,
});

/*
(async function run() {
  await client.connect();
    const result = await client.invoke(new Api.messages.getAllChats({
        exceptIds: [7475723],
        }));
    console.log(result); // prints the result
})();
*/

/*
const {Api, TelegramClient} = require('telegram');
const { StringSession } = require("telegram/sessions");
const input = require("input"); // npm i input

const apiId = 29908856;
const apiHash = "9a71691416fa1739b9c38e66f3a7f391";
const stringSession = new StringSession("1BQANOTEuMTA4LjU2LjE2MAG7J05/zsddgHLO5YTWp62CHdi0fACL5UTTazDrhUoi5w6IcZuqaBiQm8+xZGe1w5znhjW4qkGU7BGjeLbTfsv8jElDgNmupP0DJJOoOeuyqgvpfQDaUHtuH5+Cp7bO3nbCjdQmbihYLl2IigjCX8T5VyCwXtITp2Sc132UWVibOwchF9IJmozFbQ/Vlai+KLY1LuNgqZnEhZSIWBie6auS9CNK5Bc0zPIcXfSpN+a6X57buHtpy956qlRpA/8D0sRQZDvhRPziB2qQ7xpURtGvXNQIpr7wVZ6uFXsimMfZF10FtwFWeDFxtF49zNpFSnGTs6sjs9VSD64TNga2TAsYDg=="); // fill this later with the value from session.save()
*/
/*
(async () => {
  console.log("Loading interactive example...");
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });
  await client.start({
    phoneNumber: async () => await input.text("Please enter your number: "),
    password: async () => await input.text("Please enter your password: "),
    phoneCode: async () =>
      await input.text("Please enter the code you received: "),
    onError: (err) => console.log(err),
  });
  console.log("You should now be connected.");
  //console.log(client.session.save()); // Save this string to avoid logging in again
  //await client.sendMessage("me", { message: "Hello!" });
  
  await getChats(client);
	
})(); */

// const client = new TelegramClient(stringSession, apiId, apiHash, {});

// (async function run() {
//     const result = await client.invoke(new Api.messages.getAllChats({
//         exceptIds: [7475723],
//         }));
//     console.log(result); // prints the result
// })();

/*
async function getChats(client) {
	const result = await client.invoke(new Api.messages.getAllChats({
        exceptIds: [7475723],
        }));
    console.log(result); // prints the result
}

async function getMessages(client) {
	const msgs = await client.getMessages("me", {
        limit: 100,
    });
    console.log("the total number of msgs are", msgs.total);
    console.log("what we got is ", msgs.length);
    for (const msg of msgs) {
        //console.log("msg is",msg); // this line is very verbose but helpful for debugging
        console.log("msg text is : ", msg.text);
    }
}
*/