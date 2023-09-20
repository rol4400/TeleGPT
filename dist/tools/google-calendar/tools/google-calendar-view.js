"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleCalendarViewTool = void 0;
const google_calendar_base_js_1 = require("./google-calendar-base.js");
const tool_descriptions_js_1 = require("./tool-descriptions.js");
const run_view_events_js_1 = require("../api/run-view-events.js");
class GoogleCalendarViewTool extends google_calendar_base_js_1.GoogleCalendarBase {
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
            value: tool_descriptions_js_1.VIEW_TOOL_DESCRIPTION
        });
    }
    async _call(query) {
        const auth = await this.getAuth();
        const model = this.getModel();
        return await (0, run_view_events_js_1.runViewEvents)(query, {
            auth,
            model,
            calendarId: this.calendarId
        });
    }
}
exports.GoogleCalendarViewTool = GoogleCalendarViewTool;
//# sourceMappingURL=google-calendar-view.js.map