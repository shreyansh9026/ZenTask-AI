// News command
// This bot is designed by Shreyansh Tripathi.
const { EmbedBuilder } = require('discord.js');
const { askGroq, getGroqUserErrorMessage } = require('../../services/ai/groqService');
const { webSearch } = require('../../services/search/searchService');
const { buildGroqEmbed, buildSimpleEmbed } = require('../../utils/formatter');
const { logError } = require('../../utils/logger');

function buildNewsFallbackEmbed(results) {
  const description = results
    .map((item, index) => {
      const title = item.title || '(untitled)';
      const snippet = item.snippet ? `\n${item.snippet.slice(0, 180)}` : '';
      const source = item.url ? `\n${item.url}` : '';
      return `**${index + 1}. ${title}**${snippet}${source}`;
    })
    .join('\n\n')
    .slice(0, 4000);

  return new EmbedBuilder()
    .setColor(0x00b4d8)
    .setTitle('Latest News')
    .setDescription(description || 'No live headlines were returned.')
    .setFooter({ text: 'Live web results via Tavily' })
    .setTimestamp();
}

async function handleNews(message) {
  await message.channel.sendTyping();

  try {
    const prompt =
      'Give me the 5 most important global news headlines right now. ' +
      'Format each as: **[Category]** - Headline (one sentence summary). ' +
      'Be concise. Do not add extra commentary.';

    const answer = await askGroq(prompt);
    const embed = buildGroqEmbed('Latest News Headlines', answer);
    embed.setTitle('Latest News - Powered by Groq');

    return message.reply({
      content: `Latest news:\n${answer.slice(0, 1500)}`,
      embeds: [embed],
    });
  } catch (error) {
    logError('News command error:', error.response?.data || error.message);

    try {
      const results = await webSearch('latest global news headlines today', 5);

      if (results.length) {
        return message.reply({
          content: 'Groq news is unavailable right now, so here are live web headlines instead:',
          embeds: [buildNewsFallbackEmbed(results)],
        });
      }
    } catch (fallbackError) {
      logError('News fallback search error:', fallbackError.response?.data || fallbackError.message);
    }

    const messageText = getGroqUserErrorMessage(error, 'news');
    const embed = buildSimpleEmbed('error', 'News Unavailable', messageText);

    return message.reply({
      content: messageText,
      embeds: [embed],
    });
  }
}

module.exports = { handleNews };
