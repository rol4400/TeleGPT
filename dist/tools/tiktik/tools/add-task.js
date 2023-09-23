"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TiktikAddTask = void 0;
const tool_descriptions_js_1 = require("./tool-descriptions.js");
const run_add_task_js_1 = require("../api/run-add-task.js");
const tiktik_base_js_1 = require("./tiktik-base.js");
class TiktikAddTask extends tiktik_base_js_1.TiktikBase {
    constructor() {
        super();
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'tiktik-add-task'
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: tool_descriptions_js_1.ADD_TASK_DESCRIPTION
        });
    }
    async _call(query) {
        const model = this.getModel();
        return await (0, run_add_task_js_1.runAddTask)(query, {
            model,
        });
    }
}
exports.TiktikAddTask = TiktikAddTask;
//# sourceMappingURL=add-task.js.map