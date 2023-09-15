"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const { Telegraf } = require('telegraf');
const marked = require('marked');
const axios = require("axios");
const agent = require("./agent.js");
const bot = new Telegraf(process.env.BOT_TOKEN);
bot.on('voice', (ctx) => {
    ctx.sendChatAction('typing');
    ctx.telegram.getFileLink(ctx.message.voice.file_id).then((link) => {
        //link = https://api.telegram.org/file/bot<token>/<file_id>
        axios({
            url: link,
            method: "GET",
            responseType: "arraybuffer",
        }).then((get_response) => {
            const postHeaders = {
                headers: {
                    'Content-Type': 'audio/ogg',
                    'Authorization': 'Basic ' + process.env.SPEECH_TO_TEXT_IAM_APIKEY,
                },
            };
            axios.post(process.env.SPEECH_TO_TEXT_URL + "/v1/recognize", get_response.data, postHeaders)
                .then(async (post_response) => {
                var answer = await agent.runQuery(post_response.data.results[0].alternatives[0].transcript);
                return ctx.replyWithHTML(marked.parseInline(answer.output));
            })
                .catch(function (error) {
                if (process.env.NODE_ENV !== "production")
                    console.log(error);
            });
        });
    });
});
bot.on('text', async (ctx) => {
    await ctx.persistentChatAction("typing", async () => {
        var answer = await agent.runQuery(ctx.message.text);
        return ctx.replyWithHTML(marked.parseInline(answer.output));
    });
});
bot.launch();
// TODO: Add reminder capability with crontab API
// const setCRONReminder = async ({crontab, reminder_text}:any) => {
// }
//# sourceMappingURL=index.js.map