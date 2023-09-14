require('dotenv').config();

const { Telegraf } = require('telegraf')
const axios = require("axios");
const agent = require("./agent.js");

const bot = new Telegraf(process.env.BOT_TOKEN)

bot.on('voice', (ctx:any) => {
    ctx.telegram.getFileLink(ctx.message.voice.file_id).then((link:string) => {
        //link = https://api.telegram.org/file/bot<token>/<file_id>
                
        axios({
            url: link,
            method: "GET",
            responseType: "arraybuffer",
            
        }).then((get_response:any) => {
            const postHeaders = {
                headers: {
                    'Content-Type': 'audio/ogg',
                    'Authorization': 'Basic YXBpa2V5OkExU3Y5YllTZDRJTDBCN00ta2ZhNnpEQWJDYkJvYXFFdkhkV0lFSmZpT2ht',
                },
            };
            
            axios.post(process.env.SPEECH_TO_TEXT_URL + "/v1/recognize", get_response.data, postHeaders)
            .then(async (post_response:any) => {
                var answer = await agent.runQuery(post_response.data.results[0].alternatives[0].transcript);
                  return ctx.reply(answer.output)
              })
              .catch(function(error:any){
                  console.log(error)
              });
          
          });
    })
})

bot.on('text', async (ctx:any) => {

    var search = "Jn 8:44";
    var version = "NIV";


    var answer = await agent.runQuery(ctx.message.text);
    return ctx.reply(answer.output)
})

bot.launch()