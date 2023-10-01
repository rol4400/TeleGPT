"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TiktikGetTasks = void 0;
const tool_descriptions_js_1 = require("./tool-descriptions.js");
const run_get_tasks_js_1 = require("../api/run-get-tasks.js");
const tiktik_base_js_1 = require("./tiktik-base.js");
const text_spitter_js_1 = require("../../../text-spitter.js");
class TiktikGetTasks extends tiktik_base_js_1.TiktikBase {
    constructor() {
        super();
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'tiktik-get-tasks'
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: tool_descriptions_js_1.GET_TASK_DESCRIPTION
        });
    }
    async _call(query) {
        const model = this.getModel();
        var tasks = await (0, run_get_tasks_js_1.runGetTask)(query, {
            model,
        });
        // Ensure the character limit isn't breached
        return await (0, text_spitter_js_1.splitText)(tasks.text);
    }
}
exports.TiktikGetTasks = TiktikGetTasks;
//# sourceMappingURL=get-tasks.js.map