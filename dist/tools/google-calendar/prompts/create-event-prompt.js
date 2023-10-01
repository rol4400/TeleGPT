"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CREATE_EVENT_PROMPT = void 0;
exports.CREATE_EVENT_PROMPT = `
Extract the start and end times from the event description. A message may either have a start time, or a start and end time. 
And may have a duration specified. If there's only a start time, guess how long the event should go for and set event_end_time accordingly.
If the end time is specified or implied please use that end time. PAY CAREFUL attention to am and pm and get the times correct

You must ONLY chose dates that are equal to or after todays datetime!

Be careful not to let meetings conflict with times that you know other meetings are already scheduled.

Some examples are as follows:

Date format: YYYY-MM-DDThh:mm:ss+00:00
Based on this event description: "Joey birthday tomorrow at 7 pm",
output a json of the following parameters: 
Today's datetime on UTC time 2023-05-02T10:00:00+00:00, it's Tuesday and timezone
of the user is +10, take into account the timezone of the user and today's date.
1. event_summary 
2. event_start_time 
3. event_end_time 
4. event_location 
5. event_description 
6. user_timezone
event_summary:
{{
    "event_summary": "Joey birthday",
    "event_start_time": "2023-05-03T19:00:00+10:00",
    "event_end_time": "2023-05-03T20:00:00+10:00",
    "event_location": "",
    "event_description": "",
    "user_timezone": "Australia/Brisbane"
}}

Date format: YYYY-MM-DDThh:mm:ss+00:00
Based on this event description: "Create a meeting for 5 pm for 2 hours on Saturday with Joey",
output a json of the following parameters: 
Today's datetime on UTC time 2023-05-04T10:00:00+00:00, it's Thursday and timezone
of the user is +10, take into account the timezone of the user and today's date.
1. event_summary 
2. event_start_time 
3. event_end_time 
4. event_location 
5. event_description 
6. user_timezone
event_summary:
{{
    "event_summary": "Meeting with Joey",
    "event_start_time": "2023-05-06T17:00:00+10:00",
    "event_end_time": "2023-05-06T19:00:00+10:00",
    "event_location": "",
    "event_description": "",
    "user_timezone": "Australia/Brisbane"
}}

Date format: YYYY-MM-DDThh:mm:ss+00:00
Based on this event description: "Set a meeting 11am-2pm tomorrow for Joe's Birthday,
output a json of the following parameters: 
Today's datetime on UTC time 2023-05-04T10:00:00+00:00, it's Thursday and timezone
of the user is +10, take into account the timezone of the user and today's date.
1. event_summary 
2. event_start_time 
3. event_end_time 
4. event_location 
5. event_description 
6. user_timezone
event_summary:
{{
    "event_summary": "Meeting with Joey",
    "event_start_time": "2023-05-06T11:00:00+10:00",
    "event_end_time": "2023-05-06T14:00:00+10:00",
    "event_location": "",
    "event_description": "",
    "user_timezone": "Australia/Brisbane"
}}

Date format: YYYY-MM-DDThh:mm:ss+00:00
Based on this event description: "{query}", output a json of the
following parameters: 
Today's datetime on UTC time {date}, it's {dayName} and timezone of the user {u_timezone},
take into account the timezone of the user and today's date.
1. event_summary 
2. event_start_time 
3. event_end_time 
4. event_location 
5. event_description 
6. user_timezone 
event_summary:
`;
//# sourceMappingURL=create-event-prompt.js.map