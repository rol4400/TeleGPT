"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TiktikGetTasks = void 0;
const tool_descriptions_js_1 = require("./tool-descriptions.js");
const run_get_tasks_js_1 = require("../api/run-get-tasks.js");
const tiktik_base_js_1 = require("./tiktik-base.js");
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
    async _call(_query) {
        const model = this.getModel();
        return await (0, run_get_tasks_js_1.runGetTask)();
    }
}
exports.TiktikGetTasks = TiktikGetTasks;
//# sourceMappingURL=get-tasks.js.map