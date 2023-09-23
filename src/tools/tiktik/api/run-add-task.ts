require('dotenv').config();

const { PromptTemplate } = require ('langchain/prompts');
const { LLMChain } = require ('langchain/chains');
const axios = require("axios");

import { splitText } from "../../../text-spitter.js";

import { google } from 'googleapis'
import { ADD_TASK_PROMPT } from '../prompts/index.js'
import { getTimezoneOffsetInHours } from "../../google-calendar/utils/get-timezone-offset-in-hours.js";

const calendar = google.calendar('v3')

const addTask = async (
  params: any,
) => {
    var config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://ticktick.com/open/v1/task',
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.TIKTIK_API}`,
        },
        data : params
    };

    try {
        const response = await axios.request(config);
        console.log(JSON.stringify(response.data));
        return JSON.stringify(response.data)
    }
    catch (error) {
        console.log(error);
        return JSON.stringify(error);
    }
}

type RunTiktikAddTask = {
  model: any
}

const runAddTask = async (
  query: string,
  { model }: RunTiktikAddTask
) => {
  const prompt = new PromptTemplate({
    template: ADD_TASK_PROMPT,
    inputVariables: ['date', 'query', 'u_timezone', 'dayName']
  })
  const createEventChain = new LLMChain({
    llm: model,
    prompt
  })

  const date = new Date().toISOString()
  const u_timezone = getTimezoneOffsetInHours()
  const dayName = new Date().toLocaleString('en-us', { weekday: 'long' })
  
  // Ensure the character limit isn't breached
  query = await splitText(query);

  const output = await createEventChain.call({
    query,
    date,
    u_timezone,
    dayName
  })

  const loaded = JSON.parse(output['text'])

    return  await addTask(loaded);
  
}

export { runAddTask }