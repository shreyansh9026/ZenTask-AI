// Search connectivity test script
// This bot is designed by Shreyansh Tripathi.
const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.TAVILY_API_KEY;

async function test() {
  console.log('Testing Tavily API...');

  if (!API_KEY) {
    console.error('Error: TAVILY_API_KEY is not defined in .env');
    return;
  }

  try {
    const response = await axios.post(
      'https://api.tavily.com/search',
      {
        api_key: API_KEY,
        query: 'What is the current time in New York?',
        search_depth: 'basic',
      },
      { timeout: 5000 }
    );

    console.log('Response status:', response.status);
    console.log('Results found:', response.data.results?.length);
  } catch (error) {
    console.error('Error contacting Tavily:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

test();
