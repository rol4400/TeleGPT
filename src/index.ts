require('dotenv').config();

const { Telegraf } = require('telegraf');
const marked = require ('marked');
const axios = require("axios");
const Agent = require("./agent");

const bot = new Telegraf(process.env.BOT_TOKEN)

var agent = new Agent();
agent.init();

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
                // Edit the message and put the transcribed text as a caption

                // Ask the agent and wait for the response
                var answer = await agent.run(post_response.data.results[0].alternatives[0].transcript);
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
