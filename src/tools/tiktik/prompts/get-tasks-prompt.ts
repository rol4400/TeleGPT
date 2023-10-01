export const GET_TASKS_PROMPT = `

Take an input query and tiktik api data in JSON and return only the relevant information from the api data that would be required to answer the given query

Brief Example:
The query: List all current tasks
Tiktik API data: [{{"id":"6516721b8f08da5397fea70c","title":"Ask Leah about screenshots of transactions","startDate":"2023-09-29T00:00:00.000+0000","dueDate":"2023-09-29T00:00:00.000+0000","isAllDay":true,"priority":1,"status":0}},{{"id":"650efd518f0850d7d102f0d5","title":"Send CT SMN Checklist","startDate":"2023-09-30T00:00:00.000+0000","dueDate":"2023-09-30T00:00:00.000+0000","isAllDay":false,"reminder":"TRIGGER:-PT15M","repeatFlag":"RRULE:FREQ=WEEKLY;BYDAY=SA","priority":5,"status":0}},{{"id":"650efd648f0864083c5387b5","title":"Fill Class Attendance" etc...

Ask Leah about screenshots of transactions, Send CT SMN Checklist, Fill Class Attendance

The actual data is:
The query: {query}
Tiktik API data: {api}`