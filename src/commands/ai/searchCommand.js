// Search command
// This bot is designed by Shreyansh Tripathi.
const { EmbedBuilder } = require('discord.js');
const { webSearch, formatResultsForGroq } = require('../../services/search/searchService');
const { askGroq, getGroqUserErrorMessage } = require('../../services/ai/groqService');
const { logError } = require('../../utils/logger');

async function handleSearch(message, query) {
  if (!query?.trim()) {
    return message.reply('Please provide a search query. Example: `!search who won the IPL?`');
  }

  await message.channel.sendTyping();

  let results;
  try {
    results = await webSearch(query.trim(), 5);
  } catch (error) {
    logError('Search error:', error.response?.data || error.message);

    if (String(error.message).includes('No search API key')) {
      return message.reply(
        'Web search is not configured.\n' +
        'Add `TAVILY_API_KEY` to your `.env` file and try again.'
      );
    }

    return message.reply('Web search failed. Please try again later.');
  }

  if (!results.length) {
    return message.reply(`No results found for: **${query}**`);
  }

  const context = formatResultsForGroq(results);
  const prompt = `Based on the following real-time web search results, answer this user question concisely and factually for a Discord chat.
Do not make up information. Use only what is provided below.

User question: "${query}"

Search results:
${context}

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

  return message.reply({ embeds: [embed] });
}

module.exports = { handleSearch };
