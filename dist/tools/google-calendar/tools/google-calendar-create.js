import { GoogleCalendarBase } from './google-calendar-base.js';
import { CREATE_TOOL_DESCRIPTION } from './tool-descriptions.js';
import { runCreateEvent } from '../api/run-create-events.js';
export class GoogleCalendarCreateTool extends GoogleCalendarBase {
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'google_calendar_create'
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: CREATE_TOOL_DESCRIPTION
        });
    }
    async _call(query) {
        const auth = await this.getAuth();
        const model = this.getModel();
        return await runCreateEvent(query, {
            auth,
            model,
            calendarId: this.calendarId
        });
    }
}
//# sourceMappingURL=google-calendar-create.js.map