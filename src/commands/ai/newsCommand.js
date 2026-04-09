// News command
// This bot is designed by Shreyansh Tripathi.
const { EmbedBuilder } = require('discord.js');
const { askGroq, getGroqUserErrorMessage } = require('../../services/ai/groqService');
const { webSearch, formatResultsForGroq } = require('../../services/search/searchService');
const { buildGroqEmbed, buildSimpleEmbed } = require('../../utils/formatter');
const { logError } = require('../../utils/logger');
const { sendReply, deferReply } = require('../../utils/responseHelper');

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
    .setTitle('Latest Live News')
    .setDescription(description || 'No live headlines were found.')
    .setFooter({ text: 'Live web results via Tavily Advanced' })
    .setTimestamp();
}

async function handleNews(context) {
  await deferReply(context);

  try {
    // Stage 1: Fetch live headlines from the web
    const results = await webSearch('latest breaking news global headlines', 5);
    
    if (!results || results.length === 0) {
      throw new Error('No news found from web search');
    }

    // Stage 2: Let AI summarize the live findings
    const contextText = formatResultsForGroq(results);
    const prompt = `Based on these real-time search results, give me the 5 most important global news headlines right now.
Format each as: **[Category]** - Headline (one sentence summary).
Be concise. Ensure you are reporting the ACTUAL news from the results.

Search Results:
${contextText}`;

    const answer = await askGroq(prompt);
    
    // Create the premium response
    const embed = buildGroqEmbed('Latest Live News', answer);
    embed.setTitle('Breaking News - Live Updates');
    embed.setFooter({ text: 'Summarized by Groq AI using Live Search' });

    // Include sources in the description or as a separate field
    const sources = results.map((r, i) => `[${i + 1}] [${r.title.slice(0, 40)}](${r.url})`).join(' | ');
    embed.addFields({ name: 'Sources', value: sources.slice(0, 1024) });

    return sendReply(context, { embeds: [embed] });

  } catch (error) {
    logError('News command error:', error.message);

    const messageText = 'Live news is temporarily unavailable. Attempting to fetch raw headlines...';
    try {
      const fallbackResults = await webSearch('latest global news headlines', 5);
      if (fallbackResults.length) {
        return sendReply(context, {
          embeds: [buildNewsFallbackEmbed(fallbackResults)],
        });
      }
    } catch (e) {
      logError('Final news failure:', e.message);
    }

    const embed = buildSimpleEmbed('error', 'News Unavailable', 'Could not fetch live updates. Please try again later.');
    return sendReply(context, { embeds: [embed] });
  }
}

module.exports = { handleNews };
