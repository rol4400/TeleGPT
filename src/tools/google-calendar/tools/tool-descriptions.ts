export const CREATE_TOOL_DESCRIPTION = `A tool for creating Google Calendar events and meetings.

Only use this tool if the time for the meeting is exactly specified. If not, either use google_calendar_view to find a time first, or ask for a time

INPUT example:
"action": "google_calendar_create",
"action_input": "create a new meeting with John Doe tomorrow at 4pm"

OUTPUT:
Output is a confirmation of a created event.
`

export const VIEW_TOOL_DESCRIPTION = `A tool for retrieving Google Calendar events and meetings.
INPUT examples:
"action": "google_calendar_view",
"action_input": "display meetings for today"

"action": "google_calendar_view",
"action_input": "show events for tomorrow"

"action": "google_calendar_view",
"action_input": "display meetings for tomorrow between 4pm and 8pm"

"action": "google_calendar_view",
"action_input": "whats my schedule like"

"action": "google_calendar_view",
"action_input": "when am I free"

"action": "google_calendar_view",
"action_input": "suggest me a time to fit in an event"

OUTPUT:
- title, start time, end time, attendees, description (if available)

If output is empty, it means that the whole day is free
`