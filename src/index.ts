require('dotenv').config();

const { Telegraf } = require('telegraf');
const marked = require ('marked');
const axios = require("axios");
const Agent = require("./agent");

// Telegram MTPROTO API Configuration
const { Api, TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');

// Telegram API configuration
const apiId = parseInt(process.env.TELE_API_ID!);
const apiHash = process.env.TELE_API_HASH;
const session = new StringSession(process.env.TELE_STR_SESSION);
const client = new TelegramClient(session, apiId, apiHash, {});

const bot = new Telegraf(process.env.BOT_TOKEN)
var agent:any;

(async function init() {
    // Connect to the Telegram API
    await client.connect();

    agent = new Agent(client);
    agent.init();
})()

async function updateVoiceCaption(caption:string){
    const message_id = (await client.invoke(

        // Get the message ID
        new Api.messages.GetHistory({
        peer: "tele_gpt_rol4400_bot",
        offsetId: 0,
        offsetDate: 0,
        addOffset: 0,
        limit: 1,
        maxId: 0,
        minId: 0,
        hash: BigInt("-4156887774564"),
    })
    )).messages[0].id;
    
    // Update the caption
    await client.invoke(
        new Api.messages.EditMessage({
        peer: "tele_gpt_rol4400_bot",
        id: message_id,
        message: caption,
    }))
}

bot.on('voice', (ctx:any) => {
    ctx.sendChatAction('typing');
    ctx.telegram.getFileLink(ctx.message.voice.file_id).then((link:string) => {
        //link = https://api.telegram.org/file/bot<token>/<file_id>
          
        // Download the voice file
        axios({
            url: link,
            method: "GET",
            responseType: "arraybuffer",
            
        }).then((get_response:any) => {
            const postHeaders = {
                headers: {
                    'Content-Type': 'audio/ogg',
                    'Authorization': 'Basic ' + process.env.SPEECH_TO_TEXT_IAM_APIKEY,
                },
            };
            
            // Use IBM to transcribe the speech to text
            axios.post(process.env.SPEECH_TO_TEXT_URL + "/v1/recognize", get_response.data, postHeaders)
            .then(async (post_response:any) => {

                var text = post_response.data.results[0].alternatives[0].transcript;

                // Update the voice message's caption to match the speech to text result
                updateVoiceCaption(text);
        
                // Ask the agent and wait for the response
                var answer = await agent.run(text);
                  return ctx.replyWithHTML(marked.parseInline(answer.output));
              })
              .catch(function(error:any){
                if (process.env.NODE_ENV !== "production") console.log(error)
              });
          
          });
    })
})

bot.on('text', async (ctx:any) => {
    await ctx.persistentChatAction("typing", async () => {
        var answer = await agent.run(ctx.message.text);
        return ctx.replyWithHTML(marked.parseInline(answer.output));
    })
})

bot.launch()

// TODO: Add reminder capability with crontab API
// const setCRONReminder = async ({crontab, reminder_text}:any) => {

// }
