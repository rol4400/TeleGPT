const {
    GoogleCalendarAgentParams,
    GoogleCalendarBase
  } = require('./google-calendar-base.js');

const { VIEW_TOOL_DESCRIPTION } = require('./tool-descriptions.js');

const { runViewEvents } = require('./api/run-view-events.js');
  
  export class GoogleCalendarViewTool extends GoogleCalendarBase {
    name = 'google_calendar_view'
    description = VIEW_TOOL_DESCRIPTION
  
    constructor(fields:any) {
      super(fields)
    }
  
    async _call(query: string) {
      const auth = await this.getAuth()
      const model = this.getModel()
  
      return await runViewEvents(query, {
        auth,
        model,
        calendarId: this.calendarId
      })
    }
  }