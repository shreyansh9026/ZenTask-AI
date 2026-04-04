// Groq AI service
// This bot is designed by Shreyansh Tripathi.
const axios = require('axios');

const GROQ_URL = process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const API_KEY = process.env.GROQ_API_KEY;

const SYSTEM_PROMPT = `You are an intelligent Discord assistant and task manager called GroqBot.
You are helpful, concise, and friendly. Keep answers short and well-formatted for Discord.
Use markdown sparingly and prefer plain text with occasional bold or bullet points.
Never use giant walls of text. If a response needs to be long, break it into clear sections.
You do NOT fetch real-time stock prices or live sports scores unless asked with full awareness of your training cutoff.`;

function extractGroqErrorDetails(error) {
  const responseData = error?.response?.data;
  const responseError =
    typeof responseData?.error === 'string'
      ? responseData.error
      : responseData?.error?.message;
  const detailText = [
    responseError,
    responseData?.message,
    responseData?.error?.code,
    responseData?.code,
    error?.message,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const isQuotaExceeded =
    [402, 403, 429].includes(error?.response?.status) &&
    (
      detailText.includes('quota') ||
      detailText.includes('credit') ||
      detailText.includes('billing') ||
      detailText.includes('spending limit') ||
      detailText.includes('usage limit')
    );

  return {
    status: error?.response?.status ?? null,
    code: responseData?.error?.code ?? responseData?.code ?? error?.code ?? null,
    isTimeout: error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT',
    isAuthError: error?.response?.status === 401,
    isQuotaExceeded,
    isRateLimited: error?.response?.status === 429 && !isQuotaExceeded,
  };
}

function getGroqUserErrorMessage(error, featureLabel = 'AI replies') {
  const details = extractGroqErrorDetails(error);

  if (details.isQuotaExceeded) {
    return `Groq-powered ${featureLabel} are unavailable because the Groq account has hit its quota, billing, or usage limit. Please check your Groq console and try again.`;
  }

  if (details.isTimeout) {
    return 'The Groq request timed out. Please try again in a moment.';
  }

  if (details.isRateLimited) {
    return 'The Groq API rate limit was hit. Please wait a moment and try again.';
  }

  if (details.isAuthError) {
    return 'The Groq API key was rejected. Please check the bot configuration.';
  }

  return 'Something went wrong while contacting the Groq API. Please try again.';
}

async function askGroq(userMessage, history = []) {
  if (!API_KEY) {
    throw new Error('GROQ_API_KEY is not set in .env');
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-10),
    { role: 'user', content: userMessage },
  ];

  const response = await axios.post(
    GROQ_URL,
    {
      model: GROQ_MODEL,
      messages,
      max_completion_tokens: 800,
      temperature: 0.7,
    },
    {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 20_000,
    }
  );

  const content = response.data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('Groq returned an empty response.');
  }

  return content.trim();
}

async function classifyIntent(message) {
  if (!API_KEY) {
    return 'general';
  }

  const prompt = `Classify the user message into exactly ONE of these intents:
task_add, task_view, task_clear, task_delete, task_done, note_add, note_view, note_clear, note_delete, search, datetime, reminder, news, general

Rules:
- task_add: user wants to add, create, or remember a task or todo
- task_view: user wants to see, list, or show their tasks
- task_clear: user wants to clear all of their tasks
- task_delete: user wants to remove or delete a specific task
- task_done: user wants to mark a task as complete or done
- note_add: user wants to save, create, or write a note
- note_view: user wants to see or list their notes
- note_clear: user wants to clear all of their notes
- note_delete: user wants to delete a specific note
- search: user wants current or real-time information
- datetime: user asks for current time, date, or day
- reminder: user wants to set a reminder at a specific time
- news: user asks for latest news headlines
- general: anything else

Respond with ONLY the intent label.

User message: "${message}"`;

  try {
    const result = await askGroq(prompt, []);
    const clean = result.toLowerCase().trim().replace(/[^a-z_]/g, '');
    const valid = [
      'task_add',
      'task_view',
      'task_clear',
      'task_delete',
      'task_done',
      'note_add',
      'note_view',
      'note_clear',
      'note_delete',
      'search',
      'datetime',
      'reminder',
      'news',
      'general',
    ];

    return valid.includes(clean) ? clean : 'general';
  } catch {
    return 'general';
  }
}

module.exports = {
  askGroq,
  classifyIntent,
  extractGroqErrorDetails,
  getGroqUserErrorMessage,
};
