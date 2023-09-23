import { ADD_TASK_DESCRIPTION } from './tool-descriptions.js'
  
import { runAddTask } from '../api/run-add-task.js'
import { TiktikBase } from './tiktik-base.js'
  
export class TiktikAddTask extends TiktikBase {
    name = 'tiktik-add-task'
    description = ADD_TASK_DESCRIPTION

    constructor() {
        super()
    }

    async _call(query: string) {
        const model = this.getModel()

        return await runAddTask(query, {
            model,
        })
    }
}