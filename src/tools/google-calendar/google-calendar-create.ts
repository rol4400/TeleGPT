const { GoogleCalendarBase } = require ('./google-calendar-base.js');

const { CREATE_TOOL_DESCRIPTION } = require ('./tool-descriptions.js');
  
const { runCreateEvent } = require ('./api/run-create-events.js');
  
  export class GoogleCalendarCreateTool extends GoogleCalendarBase {
    name = 'google_calendar_create'
    description = CREATE_TOOL_DESCRIPTION
  
    constructor(fields:any) {
      super(fields)
    }
  
    async _call(query: string) {
      const auth = await this.getAuth()
      const model = this.getModel()
  
      return await runCreateEvent(query, {
        auth,
        model,
        calendarId: this.calendarId
      })
    }
  }