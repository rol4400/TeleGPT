import { google } from 'googleapis'
const { Tool } = require ('langchain/tools')
const { OpenAI } = require ('langchain/llms/openai')

export interface TiktikAgentParams {}

export class TiktikBase extends Tool {
  name = 'Todo and Reminders List'
  description =
    'A tool to add, edit, and view todo lists and reminders'

  constructor() {super()}

  getModel() {
    return new OpenAI({
      temperature: 0
    })
  }

  async _call(query: string) {
    return query
  }
}