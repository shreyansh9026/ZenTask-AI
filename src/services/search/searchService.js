// Search service
// This bot is designed by Shreyansh Tripathi.
const axios = require('axios');

const PROVIDER = (process.env.SEARCH_PROVIDER || 'tavily').toLowerCase();
const TAVILY_KEY = process.env.TAVILY_API_KEY;
const SERP_KEY = process.env.SERP_API_KEY;
const SEARCH_KEY = process.env.SEARCH_API_KEY;

async function webSearch(query, maxResults = 5) {
  if (PROVIDER === 'tavily' && (TAVILY_KEY || SEARCH_KEY)) {
    return tavilySearch(query, maxResults, TAVILY_KEY || SEARCH_KEY);
  }

  if (PROVIDER === 'serp' && (SERP_KEY || SEARCH_KEY)) {
    return serpSearch(query, maxResults, SERP_KEY || SEARCH_KEY);
  }

  throw new Error(
    'No search API key configured. Set TAVILY_API_KEY (or SEARCH_API_KEY) in .env.\n' +
    'Get a free key at https://tavily.com'
  );
}

async function tavilySearch(query, maxResults, apiKey) {
  const response = await axios.post(
    'https://api.tavily.com/search',
    {
      api_key: apiKey,
      query,
      max_results: maxResults,
      search_depth: 'advanced',
      include_answer: false,
      include_raw_content: false,
    },
    { timeout: 15_000 }
  );

  return (response.data.results || []).map((result) => ({
    title: result.title || '(no title)',
    url: result.url || '',
    snippet: result.content || result.snippet || '',
  }));
}

async function serpSearch(query, maxResults, apiKey) {
  const response = await axios.get('https://serpapi.com/search', {
    params: {
      api_key: apiKey,
      q: query,
      num: maxResults,
      engine: 'google',
    },
    timeout: 15_000,
  });

  return (response.data.organic_results || []).slice(0, maxResults).map((result) => ({
    title: result.title || '(no title)',
    url: result.link || '',
    snippet: result.snippet || '',
  }));
}

function formatResultsForGroq(results) {
  return results
    .map((result, index) => `[${index + 1}] ${result.title}\n${result.snippet}\nSource: ${result.url}`)
    .join('\n\n');
}

module.exports = { webSearch, formatResultsForGroq };
