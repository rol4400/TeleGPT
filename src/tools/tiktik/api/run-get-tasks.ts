require('dotenv').config();

const tick = require("./tick")

const runGetTask = async () => {
    let t = new tick({ username: process.env.TIKTIK_USER, password: process.env.TIKTIK_PASS });
    const results = await t.get_all_tasks();

    return results;
}

export { runGetTask }
