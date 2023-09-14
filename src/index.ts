require('dotenv').config();

const { Telegraf } = require('telegraf')

const bot = new Telegraf(process.env.BOT_TOKEN)

bot.on('voice', (ctx:any) => {

    
    ctx.telegram.getFileLink(ctx.message.voice.file_id).then((link:string) => {
        console.log(link);
    })
    //https://api.telegram.org/file/bot<token>/ctx.message.voice.file_id
    //https://api.telegram.org/file/bot6647669469:AAFREZp1eY8DPPA-o-k0nXnawZX_44103BU/AwACAgUAAxkBAAMJZQKiwz5nVOnbJUGBrzSEFbIm2QwAAloKAAIhFRBU3x2um4RweZUwBA
  return ctx.reply(`Voice`)
})

bot.launch()

const axios = require("axios");
const FormData = require("form-data");

axios({
  url: "https://api.telegram.org/file/bot6647669469:AAFREZp1eY8DPPA-o-k0nXnawZX_44103BU/voice/file_3.oga",
  method: "GET",
  responseType: "arraybuffer",
}).then((response) => {
    const postHeaders = {
        headers: {
        'Content-Type': 'audio/ogg',
        'Authorization': 'Basic YXBpa2V5OkExU3Y5YllTZDRJTDBCN00ta2ZhNnpEQWJDYkJvYXFFdkhkV0lFSmZpT2ht',
        },
        //data: Buffer.from(data),
    };
    
    axios.post(process.env.SPEECH_TO_TEXT_URL + "/v1/recognize", response.data, postHeaders)
    .then((response:any) => {
        console.log(JSON.stringify(response.data));
    })
    .catch(function(error:any){
        console.log(error)
    });

});

// const form = new FormData();
// form.append("binary", data);

