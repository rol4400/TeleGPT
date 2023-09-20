const { PromptTemplate } = require ('langchain/prompts');
const { LLMChain } = require ('langchain/chains');
const { google } = require ('googleapis');
const { VIEW_EVENTS_PROMPT } = import ('../prompts/view-event-prompt.js');
const { getTimezoneOffsetInHours } = import ('../utils/index.js');

const calendar = google.calendar('v3')

type RunViewEventParams = {
  calendarId: string
  auth: any
  model: any
}

const runViewEvents = async (
  query: string,
  { model, auth, calendarId }: RunViewEventParams
) => {
  const prompt = new PromptTemplate({
    template: VIEW_EVENTS_PROMPT,
    inputVariables: ['date', 'query', 'u_timezone', 'dayName']
  })
  const viewEventsChain = new LLMChain({
    llm: model,
    prompt
  })

  const date = new Date().toISOString()
  const u_timezone = getTimezoneOffsetInHours()
  const dayName = new Date().toLocaleString('en-us', { weekday: 'long' })

  const output = await viewEventsChain.call({
    query,
    date,
    u_timezone,
    dayName
  })
  const loaded = JSON.parse(output['text'])

  try {
    const response = await calendar.events.list({
      auth,
      calendarId,
      ...loaded
    })

    const curatedItems =
      response.data && response.data.items
        ? response.data.items.map(
            ({ status, summary, description, start, end }:any) => ({
              status,
              summary,
              description,
              start,
              end
            })
          )
        : []

    return (
      'Result for the prompt "' +
      query +
      '": \n' +
      JSON.stringify(curatedItems, null, 2)
    )
  } catch (error) {
    return `An error occurred: ${error}`
  }
}

// export { runViewEvents }