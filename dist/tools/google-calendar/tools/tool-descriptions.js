"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VIEW_TOOL_DESCRIPTION = exports.CREATE_TOOL_DESCRIPTION = void 0;
exports.CREATE_TOOL_DESCRIPTION = `A tool for creating Google Calendar events and meetings.

Only use this tool if the time for the meeting is exactly specified. If not, either use google_calendar_view to find a time first, or ask for a time

INPUT example:
"action": "google_calendar_create",
"action_input": "create a new meeting with John Doe tomorrow at 4pm"

OUTPUT:
Output is a confirmation of a created event.
`;
exports.VIEW_TOOL_DESCRIPTION = `A tool for retrieving Google Calendar events and meetings.
INPUT examples:
"action": "google_calendar_view",
"action_input": "display meetings for today"

"action": "google_calendar_view",
"action_input": "show events for tomorrow"

"action": "google_calendar_view",
"action_input": "display meetings for tomorrow between 4pm and 8pm"

OUTPUT:
- title, start time, end time, attendees, description (if available)
`;
//# sourceMappingURL=tool-descriptions.js.map