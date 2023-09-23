"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ADD_TASK_PROMPT = void 0;
exports.ADD_TASK_PROMPT = `

Your task is to write the JSON body of the API request that will be used to add a task to a Tiktik todo list. 

The following parameters should be present:
title: string - Task title
content: string - Task content
desc: string - Description of checklist
isAllDay: boolean - Is the task an all day event or not
startDate: Date - Start date and time in "yyyy-MM-dd'T'HH:mm:ssZ" format Example : "2019-11-13T03:00:00+0000"
dueDate: Date - Due date and time in "yyyy-MM-dd'T'HH:mm:ssZ" format Example : "2019-11-13T03:00:00+0000"
reminders: array - Lists of reminders specific to the task. The default value is "TRIGGER:-PT15M", indicating to remind 15mins before. The format "TRIGGER:-PTxxM" should be used where xx is the number of mins before the event that the reminder should be given
timeZone: string - The time zone in which the time is specified e.g. Australia/Brisbane
repeatFlag: string - Recurring rules of task Example : "RRULE:FREQ=DAILY;INTERVAL=1" would mean to repeat every day
priority: number - Value: None:0, Low:1, Medium:3, High:5
items: array - An array of items. Each item represents a step that would be required to complete this task. You can make as many items as you think appropiate to best break down the task into smaller steps

Each item has the following:
items.title: string - Item title


An example JSON body output for the query 'remind me each morning to eat breakfast' is below:

{{  
    "title" : "Eat Breakfast",  
    "content" : "Start the day off with a delicious meal",  
    "desc" : "A reminder to eat breakfast each morning",  
    "isAllDay" : false,  
    "startDate" : "2019-11-13T03:08:00+0000",  
    "dueDate" : "",  
    "reminders" : "TRIGGER:-PT15M",  
    "timeZone" : "Australia/Brisbane",  
    "repeatFlag" : "RRULE:FREQ=DAILY;INTERVAL=1",  
    "priority" : 1,  
    "items" : [ {{ "title" : "Cook breakfast" }} ]  
}}

An example JSON body output for the query 'remind me to send a template each monday afternoon' is below:

{{  
    "title" : "Eat Breakfast",  
    "content" : "Start the day off with a delicious meal",  
    "desc" : "A reminder to eat breakfast each morning",  
    "isAllDay" : false,  
    "startDate" : "2019-11-13T03:08:00+0000",  
    "dueDate" : "",  
    "reminders" : [ "TRIGGER:-PT15M" ],  
    "timeZone" : "Australia/Brisbane",  
    "repeatFlag" : "RRULE:FREQ=WEEKLY;BYDAY=MO",  
    "priority" : 1,  
    "items" : [ {{ "title" : "Send Template" }}, {{ "title" : "Fill own template" }} ]  
}}

Based on this task description: '{query}', output a json in the same format as described above. Ensure it is valid JSON. Figure out the startDate, dueDate and repeatFlag carefully from the given task description

Today's datetime on UTC time {date}, today it's {dayName} and timezone of the user {u_timezone},
take into account the timezone of the user and today's date.


`;
//# sourceMappingURL=add-task-prompt.js.map