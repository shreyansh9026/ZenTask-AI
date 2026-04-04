// Groq connectivity test script
// This bot is designed by Shreyansh Tripathi.
const axios = require('axios');
require('dotenv').config();

const GROQ_URL = process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const API_KEY = process.env.GROQ_API_KEY;

async function test() {
  console.log(`Testing Groq with Model: ${GROQ_MODEL}`);
  console.log(`URL: ${GROQ_URL}`);

  if (!API_KEY) {
    console.error('Error: GROQ_API_KEY is not defined in .env');
    return;
  }

  try {
    const response = await axios.post(
      GROQ_URL,
      {
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: 'Hello, are you working?' }],
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error contacting Groq:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

test();
