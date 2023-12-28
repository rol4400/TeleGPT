# TeleGPT
A project using Langchain to allow GPT models to interact with Telegram's APIs

## Technical Report
[TeleGPT.docx](https://github.com/rol4400/TeleGPT/files/13783669/TeleGPT.docx)

## Recent Updates:
The bot was also recently expanded to manage google calendar, ticktick todo lists. 
It was also integrated with Tasker through API calls to provide voice control as an alternative assistant on Android, and a secondary
LLM model was used to reword outputs for text to speech compatability and to prompt for extra details inside of telegram

Finally, it was recently given the capability to send messages to chatrooms. It should prompt the user before sending and can bulk send as well.

An example of a useful implementation is you can ask it "Timebox my todo list items into today's calendar and send a message to my next appointment to ask them if it's still on". 
- This will call the Ticktick API to get current todo tasks, call the calendar API for availability, call the calendar API again to schedule each appointment, then call the telegram API twice to find the profile of the next appointment and message them.
- After completing this it will report back to the user via either the telegram bot or the text to speech engine

## Demonstration:

![image](https://github.com/rol4400/TeleGPT/assets/12844299/f1c59554-ce7e-41db-8a88-ad3ed3d562c0)

Voice to text Functionality:

![image](https://github.com/rol4400/TeleGPT/assets/12844299/9be45d43-8ab5-4a4a-9835-8790d3337dfb)

Web Search Functionality:

![image](https://github.com/rol4400/TeleGPT/assets/12844299/2c518940-37da-409b-bd95-de49c3d8b086)

Dropbox Integration:

![image](https://github.com/rol4400/TeleGPT/assets/12844299/9256e955-d6f6-4bf6-b03e-a000ef92b927)

Telegram Integration:

![image](https://github.com/rol4400/TeleGPT/assets/12844299/8e6a9f3a-a392-4be1-ac6e-513975a4dba3)

![image](https://github.com/rol4400/TeleGPT/assets/12844299/a701fe33-852d-45fa-b5c2-e023ebad82a8)

![image](https://github.com/rol4400/TeleGPT/assets/12844299/a3003920-fa56-4e36-b3b3-3709efbb1b0b)
