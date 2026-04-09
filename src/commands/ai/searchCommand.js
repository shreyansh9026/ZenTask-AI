// Search command
// This bot is designed by Shreyansh Tripathi.
const { EmbedBuilder } = require('discord.js');
const { webSearch, formatResultsForGroq } = require('../../services/search/searchService');
const { askGroq, getGroqUserErrorMessage } = require('../../services/ai/groqService');
const { logError } = require('../../utils/logger');
const { sendReply, deferReply } = require('../../utils/responseHelper');

async function handleSearch(context, query) {
  if (!query?.trim()) {
    return sendReply(context, 'Please provide a search query. Example: `/search query: who won the IPL?`');
  }

  await deferReply(context);

  let results;
  try {
    results = await webSearch(query.trim(), 5);
  } catch (error) {
    logError('Search error:', error.response?.data || error.message);

    if (String(error.message).includes('No search API key')) {
      return sendReply(context, 
        'Web search is not configured.\n' +
        'Add `TAVILY_API_KEY` to your `.env` file and try again.'
      );
    }

    return sendReply(context, 'Web search failed. Please try again later.');
  }

  if (!results.length) {
    return sendReply(context, `No results found for: **${query}**`);
  }

  const contextText = formatResultsForGroq(results);
  const prompt = `You are a real-time information assistant. 
Based on the following advanced web search results, answer the user's question with absolute factual accuracy.
IF the user is asking for LIVE scores, stock prices, or current events, look for the MOST RECENT data in the snippets below.
If the search results contain live data (like scores), report it directly.

User Question: "${query}"

Search Results:
${contextText}

Answer concisely for a Discord chat. Format with bold keys if helpful.

Write a clear, short summary in 3 to 6 sentences. Include source links if relevant.`;

  let summary;
  try {
    summary = await askGroq(prompt, []);
  } catch (error) {
    logError('Groq summarization error:', error.response?.data || error.message);

    summary =
      `${getGroqUserErrorMessage(error, 'search summaries')}\n\nTop live results:\n\n` +
      results
        .map((item, index) => `**${index + 1}. ${item.title}**\n${item.snippet}\n${item.url}`)
        .join('\n\n');
  }

  const embed = new EmbedBuilder()
    .setColor(0x00b4d8)
    .setTitle(`Search: ${query.slice(0, 60)}${query.length > 60 ? '...' : ''}`)
    .setDescription(summary.length > 4000 ? `${summary.slice(0, 3997)}...` : summary)
    .addFields({
      name: 'Sources',
      value: results
        .slice(0, 3)
        .map((item, index) => `[${index + 1}] [${item.title.slice(0, 60)}](${item.url})`)
        .join('\n'),
      inline: false,
    })
    .setFooter({ text: 'Real-time search via Tavily' })
    .setTimestamp();

  return sendReply(context, { embeds: [embed] });
}

module.exports = { handleSearch };
