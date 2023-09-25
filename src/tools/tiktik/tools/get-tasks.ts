import { GET_TASK_DESCRIPTION } from './tool-descriptions.js'
  
import { runGetTask } from '../api/run-get-tasks.js'
import { TiktikBase } from './tiktik-base.js'
  
export class TiktikAddTask extends TiktikBase {
    name = 'tiktik-get-task'
    description = GET_TASK_DESCRIPTION

    constructor() {
        super()
    }

    async _call(_query: string) {
        const model = this.getModel()

        return await runGetTask();
    }
}