require('dotenv').config();
// Telegram MTPROTO API Configuration
const { Api, TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const input = require("input");
// Telegram API configuration
const apiId = parseInt(process.env.TELE_API_ID);
const apiHash = process.env.TELE_API_HASH;
const session = new StringSession("");
const client = new TelegramClient(session, apiId, apiHash, {});
(async function run() {
    // authenticate as a user
    await client.start({
        phoneNumber: async () => await input.text("number ?"),
        password: async () => await input.text("password?"),
        phoneCode: async () => await input.text("Code ?"),
        onError: (err) => console.log(err),
    });
    await client.connect();
    console.log("You should now be connected.");
    console.log(client.session.save());
})();
export {};
//# sourceMappingURL=test-mtproto.js.map