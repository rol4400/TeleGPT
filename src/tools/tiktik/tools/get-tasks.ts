import { GET_TASK_DESCRIPTION } from './tool-descriptions.js'
  
import { runGetTask } from '../api/run-get-tasks.js'
import { TiktikBase } from './tiktik-base.js'

import { splitText } from "../../../text-spitter.js";
  
export class TiktikGetTasks extends TiktikBase {
    name = 'tiktik-get-tasks'
    description = GET_TASK_DESCRIPTION

    constructor() {
        super()
    }

    async _call(query: string) {

        const model = this.getModel()

        var tasks = await runGetTask(query, {
            model,
        })

         // Ensure the character limit isn't breached
        return await splitText(tasks.text);
    }
}