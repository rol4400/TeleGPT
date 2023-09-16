require('dotenv').config();

// Telegram MTPROTO API Configuration
const { Api, TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');

// Telegram API configuration
const apiId = parseInt(process.env.TELE_API_ID!);
const apiHash = process.env.TELE_API_HASH;
const session = new StringSession("");

// Express routing
const express = require("express");
const path = require('path');
const app = express();
const port = process.env.PORT || 5000
app.use(express.json())

// Deta space data storage
const { Deta } = require('deta');
const detaInstance = Deta();  //instantiate with Data Key or env DETA_PROJECT_KEY
const db = detaInstance.Base("Users");

// Create a promise for use in prompting the user for 2FA phone codes
let globalPhoneCodePromise:any
function generatePromise() {
    let resolve
    let reject
    let promise = new Promise((_resolve, _reject) => {
        resolve = _resolve
        reject = _reject
    })
    
    return { resolve, reject, promise }
}


// app.use(express.static(path.resolve(__dirname, '../www/public')));

app.get('/testApi', function(_req:any, res:any) {
    res.send("Tested Well");
})

let client:any
app.get("/request_code/:phoneNumber", function (req:any, res:any) {

    globalPhoneCodePromise = generatePromise()
    client = new TelegramClient(session, apiId, apiHash, {
        connectionRetries: 5,
    });
    client.start({
        phoneNumber: async () => req.params.phoneNumber,
        phoneCode: async () => {
            let code = await globalPhoneCodePromise.promise

            // In case the user provided a wrong code, gram.js will try to call this function again
            // We generate a new promise here to allow user enter a new code later
            globalPhoneCodePromise = generatePromise()

            return code
        },
        onError: (err:any) => console.log(err),
    })
    res.sendStatus(200);
})

app.post("/request_code/:phoneNumber", function (req:any, _res:any) {

    globalPhoneCodePromise.resolve(req.body.phoneCode);

    db.put({ phone: req.params.phoneNumber, session: client.session.save()});
    
})

app.get('*', (_req:any, res:any) => {
    res.sendFile(path.resolve(__dirname, '../www/build', 'index.html'));
  });

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

  /*
app.post("/request_code2", function (req:any, res:any) {
    console.log("Loading interactive example...");
    const client = new TelegramClient(session, apiId, apiHash, {
        connectionRetries: 0,
    });

    // console.log(req.body.phoneNumber);

    client.start({
        phoneNumber: async () => req.body.phoneNumber,
        password: async () => req.body.password,
        phoneCode: async () => req.body.phoneCode,
        onError: (err:any) => console.log(err),
    });

    console.log("You should now be connected.");
    //console.log(client.session.save()); // Save this string to avoid logging in again
    //await client.sendMessage("me", { message: "Hello!" });
    
    res.send("Request sent");
});


*/
/*
})

app.post("/request_code", function (req:any, res:any) {
  

*/