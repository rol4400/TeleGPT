import { GoogleCalendarBase } from './google-calendar-base.js';
import { VIEW_TOOL_DESCRIPTION } from './tool-descriptions.js';
import { runViewEvents } from '../api/run-view-events.js';
export class GoogleCalendarViewTool extends GoogleCalendarBase {
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'google_calendar_view'
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: VIEW_TOOL_DESCRIPTION
        });
    }
    async _call(query) {
        const auth = await this.getAuth();
        const model = this.getModel();
        return await runViewEvents(query, {
            auth,
            model,
            calendarId: this.calendarId
        });
    }
}
//# sourceMappingURL=google-calendar-view.js.map