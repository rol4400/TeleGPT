"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET_TASK_DESCRIPTION = exports.ADD_TASK_DESCRIPTION = void 0;
exports.ADD_TASK_DESCRIPTION = `A tool for adding events to a todo list and for adding reminders

INPUT example:
"action": "tiktik-add-task",
"action_input": "Add 'message bob about the script' to my todo list"

"action": "tiktik-add-task",
"action_input": "Remind me to make my ppt tomorrow morning"

OUTPUT:
Output is a confirmation of a created task on the todo list.
`;
exports.GET_TASK_DESCRIPTION = `A tool gettings all the tasks and reminders on the todo list. Be specific with what information you want about the tasks returned
This tool should be called again with a new query if information is not known about a task / todo / reminder to get more information

"action": "tiktik-get-tasks",
"action_input": "List all current tasks"

OUTPUT:
A list of tasks

"action": "tiktik-get-tasks",
"action_input": "Find all tasks with time"

OUTPUT:
A list of tasks and corresponding times`;
//# sourceMappingURL=tool-descriptions.js.map